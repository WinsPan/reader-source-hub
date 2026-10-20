// 选择、历史与变更清单：纯函数，便于单元测试
import crypto from 'node:crypto'

export const BRAND_QUOTA = 2
export const STREAK_CAP = 7

export function hostOf(url) {
  const m = /^https?:\/\/([^/#?:]+)/i.exec(url ?? '')
  return m ? m[1].toLowerCase().replace(/^(www|m|wap)\./, '') : `${url ?? ''}`
}

/**
 * 打分（满分 1）：
 *  连续可用天数 0.35（封顶 7 天）+ 上一版已发布 0.15 + 最新章可读 0.15 + 发现可用 0.1 + 速度 0.25
 *  失败复检后才通过（不稳定）扣 0.15
 * 上一版的书源只要仍可用就优先保留，避免每天大换血
 */
export function scoreOf(r, history, prevUrls) {
  const url = r.source.bookSourceUrl
  const streak = Math.min(history[url]?.streak ?? 0, STREAK_CAP)
  const speed = 1 - Math.min(r.ms, 60000) / 60000
  return (streak / STREAK_CAP) * 0.35 + (prevUrls.has(url) ? 0.15 : 0) + (r.latestOk ? 0.15 : 0) +
    (r.explore ? 0.1 : 0) + speed * 0.25 - (r.flaky ? 0.15 : 0)
}

/**
 * 选出最终书源：品牌各取 BRAND_QUOTA 个（发现可用优先，再按得分），
 * 其余只取发现可用的，按得分补足到 target；同站只留一个，正文指纹相同（同一后端的镜像站）也只留一个
 * @param results [{ source, ok, explore, latestOk, flaky, fingerprint, ms, brand }]
 */
export function selectSources(results, { target, brands, history, prevUrls }) {
  const score = (r) => scoreOf(r, history, prevUrls)
  const ok = results.filter((r) => r.ok)
    .sort((a, b) => (a.explore === b.explore ? score(b) - score(a) : (a.explore ? -1 : 1)))
  const picked = []
  const hosts = new Set()
  const prints = new Set()
  const pick = (r) => {
    picked.push(r)
    hosts.add(hostOf(r.source.bookSourceUrl))
    if (r.fingerprint) {
      prints.add(r.fingerprint)
    }
  }
  for (const brand of brands) {
    ok.filter((r) => r.brand === brand).slice(0, BRAND_QUOTA).forEach(pick)
  }
  for (const r of ok) {
    if (picked.length >= target) {
      break
    }
    if (r.brand || !r.explore || hosts.has(hostOf(r.source.bookSourceUrl)) ||
      (r.fingerprint && prints.has(r.fingerprint))) {
      continue
    }
    pick(r)
  }
  return picked
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

export const MIN_PUBLISH = 20

/** 安全门：入选不足 20 个（多半是网络问题或候选太少）时不发布，保留上一版 */
export function publishable(selectedCount, prevCount) {
  if (selectedCount < MIN_PUBLISH) {
    return `入选书源只有 ${selectedCount} 个（少于 ${MIN_PUBLISH}）`
  }
  if (prevCount > 0 && selectedCount < prevCount * 0.5) {
    return `入选 ${selectedCount} 个，不到上一版 ${prevCount} 个的一半`
  }
  return ''
}
