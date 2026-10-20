// 严格检测：比客户端的检测（一个关键词、只读第一章、正文 ≥30 字）更接近真实阅读
//  1. 搜索相关性：书源自带的检测词 → 发现页里的书名 → 通用词「重生」→ 几部热门长篇，搜索结果须有书名匹配的书
//     （平台书源如七猫、番茄没有起点作品，只用热门长篇会误判为搜索失败）
//  2. 目录：至少 10 章，章节地址 / 标题不能大量重复
//  3. 正文抽样：第一章、中间章、最新章；检查字数、乱码、字体混淆、锁章 / 登录墙 / 反爬页、中文比例，各章内容须互不相同
//  4. 发现：任一分类能列出至少 3 本书
//  0. 预检：书源首页 8 秒内连不上（DNS、拒绝连接、超时）直接判失效，不再逐项等待超时
//  5. 网络类失败（超时、连接错误）隔几秒复检一次，第二次才通过的记为不稳定；规则类失败不复检
import { contentFingerprint, contentProblem, distinctContents, relevantHit, tocProblem } from './quality.mjs'

// 通用词放在热门长篇之前：任何书库都有书名含「重生」的书
const PROBES = ['重生', '诡秘之主', '斗破苍穹', '凡人修仙传', '剑来']
const CHECK_TIMEOUT = 120000
const RETRY_DELAY = 3000
const NETWORK_ERROR = /超时|timeout|timed out|fetch failed|ECONN|ENOTFOUND|EAI_AGAIN|socket|network|aborted|请求失败/i

class StepError extends Error {
  constructor(step, message) {
    super(message)
    this.step = step
  }
}

function withTimeout(p, ms) {
  let timer
  return Promise.race([
    p.finally(() => clearTimeout(timer)),
    new Promise((_, reject) => {
      timer = setTimeout(() => reject(new StepError('超时', `检测超过 ${ms / 1000} 秒`)), ms)
    })
  ])
}

async function exploreSample(E, source) {
  if (!source.exploreUrl || !source.ruleExplore?.bookList) {
    return []
  }
  const items = (await E.parseExploreUrl(source).catch(() => [])).filter((i) => !!i.url).slice(0, 3)
  for (const item of items) {
    const books = await E.exploreBooks(source.bookSourceUrl, source.ruleExplore, item.url, 1, 10, source).catch(() => [])
    const valid = books.filter((b) => b.bookUrl && b.name)
    if (valid.length >= 3) {
      return valid
    }
  }
  return []
}

async function findBook(E, source, explored, r) {
  const keywords = [source.ruleSearch?.checkKeyWord, ...explored.slice(0, 2).map((b) => b.name), ...PROBES]
    .map((k) => `${k ?? ''}`.trim()).filter((k, i, a) => k && a.indexOf(k) === i).slice(0, 4)
  let anyResult = false
  for (const k of keywords) {
    const books = await E.searchBooks(source, k, 1).catch(() => [])
    anyResult ||= books.some((b) => b.bookUrl)
    const hit = relevantHit(books, k)
    if (hit) {
      r.keyword = k
      return hit
    }
  }
  throw new StepError('搜索', anyResult ? '搜索结果与关键词不相关' : '搜索无结果')
}

async function readChapter(E, source, book, chapters, index) {
  const text = await E.fetchChapterContent(source, book, chapters, index, false)
  return { index, text, problem: source.bookSourceType === 0 ? contentProblem(text) : '' }
}

async function runOnce(E, source, r) {
  if (!source.searchUrl) {
    throw new StepError('搜索', '无搜索地址')
  }
  r.step = '发现'
  const explored = await exploreSample(E, source)
  r.explore = explored.length >= 3

  r.step = '搜索'
  const hit = await findBook(E, source, explored, r)

  r.step = '详情'
  const book = new E.Books()
  book.bookName = hit.name
  book.author = hit.author
  book.bookUrl = hit.bookUrl
  book.origin = source.bookSourceUrl
  const [info, html] = await E.fetchBookInfo(source, book)
  book.toUrl = info.tocUrl

  r.step = '目录'
  const chapters = await E.fetchChapterList(source, book, info.tocUrl, html, false)
  const tocIssue = tocProblem(chapters)
  if (tocIssue) {
    throw new StepError('目录', tocIssue)
  }
  r.chapters = chapters.length

  r.step = '正文'
  const n = chapters.length
  const first = await readChapter(E, source, book, chapters, 0)
  if (first.problem) {
    throw new StepError('正文', `第一章：${first.problem}`)
  }
  const mid = await readChapter(E, source, book, chapters, Math.floor(n / 2))
  if (mid.problem) {
    throw new StepError('正文', `中间章：${mid.problem}`)
  }
  // 最新章可能是请假条或刚更新未完的章节，失败时退一章再试；仍失败只扣分不淘汰
  let latest = await readChapter(E, source, book, chapters, n - 1).catch((e) => ({ problem: e.message }))
  if (latest.problem) {
    latest = await readChapter(E, source, book, chapters, n - 2).catch((e) => ({ problem: e.message }))
  }
  r.latestOk = !latest.problem
  r.latestProblem = latest.problem ?? ''
  if (!distinctContents([first.text, mid.text, r.latestOk ? latest.text : ''])) {
    throw new StepError('正文', '不同章节取到相同内容')
  }
  r.chars = first.text.replace(/\s/g, '').length
  r.fingerprint = contentFingerprint(hit.name, first.text)
  r.step = '完成'
}

const PREFLIGHT_TIMEOUT = 8000
// 搜书覆盖面：通过检测的书源再搜这几部热门书，能搜到的越多，换源时越用得上
const COVERAGE_TITLES = ['诡秘之主', '斗破苍穹', '凡人修仙传', '剑来', '十日终焉', '大奉打更人']
const COVERAGE_TIMEOUT = 60000

async function coverageOf(E, source) {
  const hits = await withTimeout(Promise.all(COVERAGE_TITLES.map((t) =>
    E.searchBooks(source, t, 1).then((books) => (relevantHit(books, t) ? 1 : 0)).catch(() => 0))), COVERAGE_TIMEOUT)
    .catch(() => [])
  return hits.reduce((a, b) => a + b, 0)
}

/** 站点是否可连接：收到任何 HTTP 响应（含 4xx/5xx）都算可连接，交给后续步骤判断 */
async function reachable(source) {
  const base = `${source.bookSourceUrl ?? ''}`.split('#')[0].trim()
  if (!/^https?:\/\//i.test(base)) {
    return true
  }
  try {
    const res = await fetch(base, { redirect: 'manual', signal: AbortSignal.timeout(PREFLIGHT_TIMEOUT) })
    await res.body?.cancel()
    return true
  } catch {
    return false
  }
}

/**
 * 严格检测单个书源
 * @returns { source, brand, ok, explore, latestOk, flaky, chapters, chars, keyword, fingerprint, step, message, ms }
 */
export async function deepCheck(E, source, brand = '') {
  const start = Date.now()
  if (!(await reachable(source))) {
    return { source, brand, ok: false, explore: false, latestOk: false, flaky: false, chapters: 0, chars: 0,
      keyword: '', fingerprint: '', step: '预检', message: '站点无法访问', latestProblem: '', ms: Date.now() - start }
  }
  const attempt = async () => {
    const r = { source, brand, ok: false, explore: false, latestOk: false, flaky: false, chapters: 0, chars: 0,
      keyword: '', fingerprint: '', step: '', message: '', latestProblem: '' }
    try {
      await withTimeout(runOnce(E, source, r), CHECK_TIMEOUT)
      r.ok = true
    } catch (e) {
      r.step = e.step ?? r.step
      r.message = `${e?.message ?? e}`.slice(0, 120)
    }
    return r
  }
  let r = await attempt()
  if (!r.ok && NETWORK_ERROR.test(`${r.step} ${r.message}`)) {
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY))
    const second = await attempt()
    if (second.ok) {
      second.flaky = true
      r = second
    }
  }
  r.ms = Date.now() - start
  // 覆盖面不计入耗时（速度只反映搜索与阅读本身）
  r.coverage = r.ok ? await coverageOf(E, source) : 0
  return r
}
