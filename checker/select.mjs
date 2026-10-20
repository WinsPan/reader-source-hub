// 选择、历史与变更清单：纯函数，便于单元测试
import crypto from 'node:crypto'

export const BRAND_QUOTA = 2
export const STREAK_CAP = 7

export function hostOf(url) {
  const m = /^https?:\/\/([^/#?:]+)/i.exec(url ?? '')
  return m ? m[1].toLowerCase().replace(/^(www|m|wap)\./, '') : `${url ?? ''}`
}

export const FEATURED_COUNT = 5
// 搜书覆盖面：deep.mjs 用这几部热门书检测能搜到几部
export const COVERAGE_MAX = 6

/**
 * 打分（满分 1），侧重「搜书与换源」：
 *  搜书覆盖面 0.35 + 连续可用天数 0.25（封顶 7 天）+ 速度 0.2 + 最新章可读 0.1 + 上一版已发布 0.1
 *  失败复检后才通过（不稳定）扣 0.15
 * 上一版的书源只要仍可用就优先保留，避免每天大换血
 */
export function scoreOf(r, history, prevUrls) {
  const url = r.source.bookSourceUrl
  const streak = Math.min(history[url]?.streak ?? 0, STREAK_CAP)
  const speed = 1 - Math.min(r.ms, 60000) / 60000
  const coverage = Math.min(r.coverage ?? 0, COVERAGE_MAX) / COVERAGE_MAX
  return coverage * 0.35 + (streak / STREAK_CAP) * 0.25 + speed * 0.2 + (r.latestOk ? 0.1 : 0) +
    (prevUrls.has(url) ? 0.1 : 0) - (r.flaky ? 0.15 : 0)
}

// 成人 / 同人向书源不入选（按书源名称与分组判断）
const EXCLUDED = /🔞|肉|腐|耽美|同人|成人|18禁|情色|黄文|里番|海棠|BL|GL|百合|NTR/i

/** 书源名去掉表情、符号和空白后用于去重（同一站点换了域名常同名） */
export function nameKey(source) {
  return `${source?.bookSourceName ?? ''}`.replace(/[\p{Extended_Pictographic}\p{P}\p{S}\s]/gu, '').toLowerCase()
}

export function excludedSource(source) {
  return EXCLUDED.test(`${source?.bookSourceName ?? ''} ${source?.bookSourceGroup ?? ''}`)
}

/** 7 天内检测失败过、且没有成功过的书源跳过，把时间留给新候选 */
export function recentlyFailed(history, url, now) {
  const h = history[url]
  return !!h && h.streak === 0 && (h.fails ?? 0) > 0 && now - (h.lastSeen ?? 0) < 7 * 86400000
}

/**
 * 选出最终书源，分两层（结果按层排序，r.tier 标出所在层）：
 *  1. 精选（featured）：发现、搜索、阅读全都可用的前 FEATURED_COUNT 个，品牌优先 —— 用于发现页浏览；
 *  2. 换源池（pool）：只要求搜索与阅读，按搜书覆盖面等得分补足到 target —— 用于搜书与阅读时换源。
 * 七猫 / 番茄 / 猫眼各保留 BRAND_QUOTA 个（有发现页的进精选）；
 * 同书源地址、同站、同名（同一站点的不同域名）、正文指纹相同（同一后端的镜像站）只留一个；成人 / 同人向不入选
 * @param results [{ source, ok, explore, latestOk, flaky, fingerprint, coverage, ms, brand }]
 */
export function selectSources(results, { target, brands, history, prevUrls }) {
  const score = (r) => scoreOf(r, history, prevUrls)
  const ok = results.filter((r) => r.ok && !excludedSource(r.source)).sort((a, b) => score(b) - score(a))
  const picked = []
  const hosts = new Set()
  const prints = new Set()
  const urls = new Set()
  const names = new Set()
  const taken = (r) => urls.has(r.source.bookSourceUrl) || hosts.has(hostOf(r.source.bookSourceUrl)) ||
    (!!r.fingerprint && prints.has(r.fingerprint)) || names.has(nameKey(r.source))
  const pick = (r, tier) => {
    if (taken(r) || picked.length >= target) {
      return false
    }
    urls.add(r.source.bookSourceUrl)
    hosts.add(hostOf(r.source.bookSourceUrl))
    names.add(nameKey(r.source))
    if (r.fingerprint) {
      prints.add(r.fingerprint)
    }
    r.tier = tier
    picked.push(r)
    return true
  }
  // 1. 精选：有发现页的，品牌在前
  const full = ok.filter((r) => r.explore)
  for (const r of [...full.filter((x) => x.brand), ...full.filter((x) => !x.brand)]) {
    if (picked.length >= FEATURED_COUNT) {
      break
    }
    pick(r, 'featured')
  }
  // 2. 品牌名额：精选里已有的计入，不足的从换源池补
  for (const brand of brands) {
    let count = picked.filter((r) => r.brand === brand).length
    for (const r of ok.filter((x) => x.brand === brand)) {
      if (count >= BRAND_QUOTA) {
        break
      }
      if (pick(r, 'pool')) {
        count++
      }
    }
  }
  // 3. 换源池：其余按得分补足
  for (const r of ok) {
    if (picked.length >= target) {
      break
    }
    if (!r.brand) {
      pick(r, 'pool')
    }
  }
  return [...picked.filter((r) => r.tier === 'featured'), ...picked.filter((r) => r.tier === 'pool')]
}

/** 更新历史：可用则连续天数 +1，失败清零；30 天未出现的条目删除 */
export function updateHistory(history, results, now) {
  const out = {}
  const monthAgo = now - 30 * 86400000
  for (const [url, h] of Object.entries(history)) {
    if ((h.lastSeen ?? 0) >= monthAgo) {
      out[url] = { ...h }
    }
  }
  for (const r of results) {
    const url = r.source.bookSourceUrl
    const h = out[url] ?? { streak: 0, fails: 0 }
    out[url] = r.ok
      ? { streak: h.streak + 1, fails: 0, lastOk: now, lastSeen: now }
      : { streak: 0, fails: h.fails + 1, lastOk: h.lastOk, lastSeen: now }
  }
  return out
}

/** 书源中所有 JS（jsLib 与 @js: / <js> 规则）的指纹，用于标出 JS 有变化的书源 */
export function jsFingerprint(source) {
  const parts = []
  const walk = (v) => {
    if (typeof v === 'string') {
      if (/@js:|<js>|\{\{/.test(v)) {
        parts.push(v)
      }
    } else if (v && typeof v === 'object') {
      Object.keys(v).sort().forEach((k) => walk(v[k]))
    }
  }
  walk(source)
  parts.push(source.jsLib ?? '')
  return crypto.createHash('sha256').update(parts.join('\u0000')).digest('hex').slice(0, 16)
}

export function diffSources(prev, next) {
  const prevMap = new Map(prev.map((s) => [s.bookSourceUrl, s]))
  const nextMap = new Map(next.map((s) => [s.bookSourceUrl, s]))
  const brief = (s) => ({ name: s.bookSourceName, url: s.bookSourceUrl })
  return {
    added: next.filter((s) => !prevMap.has(s.bookSourceUrl)).map(brief),
    removed: prev.filter((s) => !nextMap.has(s.bookSourceUrl)).map(brief),
    jsChanged: next.filter((s) => prevMap.has(s.bookSourceUrl) &&
      jsFingerprint(prevMap.get(s.bookSourceUrl)) !== jsFingerprint(s)).map(brief)
  }
}

export const MIN_PUBLISH = 5

/** 安全门：入选不足 5 个，或不到上一版的一半（多半是网络问题）时不发布，保留上一版 */
export function publishable(selectedCount, prevCount) {
  if (selectedCount < MIN_PUBLISH) {
    return `入选书源只有 ${selectedCount} 个（少于 ${MIN_PUBLISH}）`
  }
  if (prevCount > 0 && selectedCount < prevCount * 0.5) {
    return `入选 ${selectedCount} 个，不到上一版 ${prevCount} 个的一半`
  }
  return ''
}
