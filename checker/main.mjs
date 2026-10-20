// 书源检测器：收集候选 → 完整链路检测 → 选出至多 target 个 → 写出 sources.json / manifest.json / history.json
// 用法：node checker/main.mjs [--out dist] [--prev prev] [--target 50] [--pages 30] [--budget-min 45] [--verbose]
// 尽量选满 target 个；入选不足 20 个时不发布
// 默认只打印统计数字（公开仓库的日志不出现书源名称和地址），--verbose 打印逐个检测结果
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { parseArgs } from 'node:util'
import { diffSources, hostOf, publishable, selectSources, updateHistory } from './select.mjs'
import { deepCheck } from './deep.mjs'

const { values: args } = parseArgs({
  options: {
    out: { type: 'string', default: 'dist' },
    prev: { type: 'string', default: 'prev' },
    target: { type: 'string', default: '50' },
    pages: { type: 'string', default: '30' },
    'brand-max': { type: 'string', default: '15' },
    concurrency: { type: 'string', default: '10' },
    'budget-min': { type: 'string', default: '45' },
    verbose: { type: 'boolean', default: false }
  }
})
const TARGET = Number(args.target)
const PAGES = Number(args.pages)
const BRAND_MAX = Number(args['brand-max'])
const CONCURRENCY = Number(args.concurrency)
const DEADLINE = Date.now() + Number(args['budget-min']) * 60000

// 书源站点证书常不规范，与客户端一致跳过校验（检测器不携带任何密钥）
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
const say = (msg) => process.stdout.write(`${msg}\n`)
if (!args.verbose) {
  // 引擎日志含书源名称与地址，公开日志中静默
  for (const k of ['log', 'info', 'warn', 'error', 'debug']) {
    console[k] = () => {}
  }
  process.removeAllListeners('warning')
  process.on('warning', () => {})
}

const E = await import('../vendor/engine.mjs')

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch {
    return fallback
  }
}

/** 并发执行；同一站点的任务不同时进行，避免触发频率限制；超过总时长不再领取 */
async function runPool(items, concurrency, keyOf, fn) {
  const queue = items.slice()
  const active = new Set()
  const worker = async () => {
    while (queue.length > 0 && Date.now() < DEADLINE) {
      const idx = queue.findIndex((it) => !active.has(keyOf(it)))
      if (idx < 0) {
        await new Promise((r) => setTimeout(r, 200))
        continue
      }
      const item = queue.splice(idx, 1)[0]
      const key = keyOf(item)
      active.add(key)
      try {
        await fn(item)
      } catch {
        // 单个任务失败不影响整体
      } finally {
        active.delete(key)
      }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker))
}

const started = Date.now()
const prevSources = readJson(path.join(args.prev, 'sources.json'), [])
const prevManifest = readJson(path.join(args.prev, 'manifest.json'), null)
const history = readJson(path.join(args.prev, 'history.json'), {})
const prevUrls = new Set(prevSources.map((s) => s.bookSourceUrl))
const stats = { prev: prevSources.length, candidates: 0, checked: 0, ok: 0, failed: 0, downloadFailed: 0 }

const results = []
const seen = new Set()
const triedHosts = new Set()

const brandOf = (s) => E.BRANDS.find((b) => (s.bookSourceName ?? '').includes(b)) ?? ''
const failReasons = {}

async function check(source) {
  const r = await deepCheck(E, source, brandOf(source))
  results.push(r)
  if (!r.ok) {
    failReasons[r.step] = (failReasons[r.step] ?? 0) + 1
  }
  stats.checked++
  r.ok ? stats.ok++ : stats.failed++
  if (args.verbose) {
    say(`${r.ok ? '可用' : '失效'} ${source.bookSourceName} ${r.ms}ms` +
      (r.ok ? ` 目录${r.chapters}章 首章${r.chars}字${r.explore ? ' 发现可用' : ''}${r.latestOk ? '' : ` 最新章不可读（${r.latestProblem}）`}${r.flaky ? ' 不稳定' : ''}`
        : ` ${r.step}：${r.message}`))
  }
}

async function download(repo) {
  try {
    return await E.fetchRepoSource(repo.id)
  } catch {
    stats.downloadFailed++
    return []
  }
}

// 1. 上一版书源全部复检
say(`复检上一版书源 ${prevSources.length} 个`)
prevSources.forEach((s) => {
  seen.add(s.bookSourceUrl)
  triedHosts.add(hostOf(s.bookSourceUrl))
})
stats.candidates += prevSources.length
await runPool(prevSources, CONCURRENCY, (s) => hostOf(s.bookSourceUrl), check)

// 2. 重点品牌：每个品牌检测排名靠前的若干版本
for (const brand of E.BRANDS) {
  const found = E.rankRepoSources((await E.searchRepoBoth(brand, 1).catch(() => [])))
    .filter((r) => r.name.includes(brand)).slice(0, BRAND_MAX)
  say(`品牌「${brand}」候选 ${found.length} 个`)
  stats.candidates += found.length
  await runPool(found, CONCURRENCY, (r) => r.id, async (repo) => {
    const s = (await download(repo)).find((x) => !seen.has(x.bookSourceUrl))
    if (s) {
      seen.add(s.bookSourceUrl)
      await check(s)
    }
  })
}

// 3. 通用补充：按综合评分逐页检测，同站只测一个，入选数足够或到时即停
for (let page = 1; page <= PAGES && Date.now() < DEADLINE; page++) {
  const current = selectSources(results, { target: TARGET, brands: E.BRANDS, history, prevUrls })
  if (current.length >= TARGET && page > 3) {
    break
  }
  const candidates = E.rankRepoSources(await E.searchRepoBoth('', page).catch(() => []))
    .filter((r) => r.url && !r.name.includes('🔞') && !E.BRANDS.some((b) => r.name.includes(b)))
    .filter((r) => {
      const h = hostOf(r.url)
      if (triedHosts.has(h)) {
        return false
      }
      triedHosts.add(h)
      return true
    })
  say(`第 ${page} 页候选 ${candidates.length} 个`)
  stats.candidates += candidates.length
  await runPool(candidates, CONCURRENCY, (r) => hostOf(r.url), async (repo) => {
    const s = (await download(repo)).find((x) => !seen.has(x.bookSourceUrl) &&
      (x.bookSourceType ?? 0) === 0 && !!x.exploreUrl)
    if (s) {
      seen.add(s.bookSourceUrl)
      await check(s)
    }
  })
}

// 4. 选择与输出
const now = Date.now()
const selected = selectSources(results, { target: TARGET, brands: E.BRANDS, history, prevUrls })
const sources = selected.map((r) => r.source)
const newHistory = updateHistory(history, results, now)
const body = JSON.stringify(sources)
const manifest = {
  version: now,
  generatedAt: new Date(now).toISOString(),
  count: sources.length,
  sha256: crypto.createHash('sha256').update(body).digest('hex'),
  previousVersion: prevManifest?.version ?? null,
  changes: diffSources(prevSources, sources),
  stats: { ...stats, failReasons, selected: sources.length, durationSec: Math.round((now - started) / 1000) }
}
fs.mkdirSync(args.out, { recursive: true })
fs.writeFileSync(path.join(args.out, 'history.json'), JSON.stringify(newHistory))
const blocked = publishable(sources.length, prevSources.length)
say(`候选 ${stats.candidates} · 检测 ${stats.checked} · 可用 ${stats.ok} · 失效 ${stats.failed} · 下载失败 ${stats.downloadFailed} · 入选 ${sources.length}` +
  ` · 新增 ${manifest.changes.added.length} · 移除 ${manifest.changes.removed.length} · JS 变更 ${manifest.changes.jsChanged.length}` +
  ` · 用时 ${manifest.stats.durationSec}s`)
say(`失效环节：${Object.entries(failReasons).map(([k, v]) => `${k} ${v}`).join(' · ') || '无'}`)
if (blocked) {
  say(`未通过安全门，不生成发布文件：${blocked}`)
  process.exit(2)
}
fs.writeFileSync(path.join(args.out, 'sources.json'), body)
fs.writeFileSync(path.join(args.out, 'manifest.json'), JSON.stringify(manifest, null, 2))
say(`已写出 ${args.out}/sources.json、manifest.json、history.json`)
// 引擎中可能残留未结束的网络请求或定时器
process.exit(0)
