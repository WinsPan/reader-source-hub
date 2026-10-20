// 正文 / 目录 / 搜索结果的质量判定：纯函数，便于单元测试

// 正文较短且命中这些词，多半是锁章、登录墙、反爬页或占位内容
const BLOCK_PATTERNS = [
  /请?先?登录/, /VIP/i, /订阅本章/, /购买(本章|章节)/, /充值/, /余额不足/, /付费章节/,
  /正在手打/, /内容(正在)?(更新|加载)中/, /请稍后(再试|重试)/, /请刷新/, /防采集/, /访问(过于)?频繁/,
  /验证码/, /Just a moment/i, /Cloudflare/i, /Access Denied/i, /403 Forbidden/i, /404 Not Found/i
]

const LONG_ENOUGH = 1000

export function normalizeTitle(s) {
  return `${s ?? ''}`.replace(/[\s《》<>【】\[\]（）()·:：,，。.!！?？'"“”‘’-]/g, '').toLowerCase()
}

/** 搜索结果是否与关键词相关：书名规范化后包含关键词 */
export function relevantHit(books, keyword) {
  const k = normalizeTitle(keyword)
  if (!k) {
    return undefined
  }
  const hits = books.filter((b) => b.bookUrl && normalizeTitle(b.name).includes(k))
  // 书名完全相同的优先
  return hits.find((b) => normalizeTitle(b.name) === k) ?? hits[0]
}

/** 正文质量：返回空串表示通过，否则为失败原因 */
export function contentProblem(text, minChars = 300) {
  const t = `${text ?? ''}`
  const compact = t.replace(/\s/g, '')
  if (compact.length === 0) {
    return '正文为空'
  }
  if (/锟斤拷|�{3,}/.test(t)) {
    return '正文乱码'
  }
  const pua = (compact.match(/[-]/g) ?? []).length
  if (pua / compact.length > 0.01) {
    return '正文含字体混淆字符'
  }
  if (compact.length < LONG_ENOUGH) {
    const hit = BLOCK_PATTERNS.find((p) => p.test(t))
    if (hit) {
      return `正文疑似锁章或拦截（${hit.source}）`
    }
  }
  if (compact.length < minChars) {
    return `正文过短（${compact.length} 字）`
  }
  const letters = compact.replace(/[\p{P}\p{S}\d]/gu, '')
  const cjk = (letters.match(/\p{Script=Han}/gu) ?? []).length
  if (letters.length > 0 && cjk / letters.length < 0.5) {
    return '正文中文比例过低'
  }
  return ''
}

/** 多章正文是否互不相同（取前 200 字比较），相同说明规则取到了公共内容而非正文 */
export function distinctContents(texts) {
  const heads = texts.filter(Boolean).map((t) => t.replace(/\s/g, '').slice(0, 200))
  return new Set(heads).size === heads.length
}

/** 目录质量：返回空串表示通过 */
export function tocProblem(chapters, minCount = 10) {
  if (chapters.length === 0) {
    return '目录为空'
  }
  if (chapters.length < minCount) {
    return `目录过短（${chapters.length} 章）`
  }
  const urls = new Set(chapters.map((c) => c.url).filter(Boolean))
  if (urls.size < chapters.length * 0.9) {
    return '目录章节地址大量重复'
  }
  const titles = new Set(chapters.map((c) => c.title))
  if (titles.size < chapters.length * 0.7) {
    return '目录章节标题大量重复'
  }
  return ''
}

/** 正文指纹：同一本书在不同书源取到相同正文，说明是同一后端的镜像 */
export function contentFingerprint(bookName, text) {
  return `${normalizeTitle(bookName)}|${`${text ?? ''}`.replace(/\s/g, '').slice(20, 120)}`
}
