import { test } from 'node:test'
import assert from 'node:assert/strict'
import { diffSources, excludedSource, hostOf, publishable, recentlyFailed, selectSources, updateHistory } from '../checker/select.mjs'

const src = (url, extra = {}) => ({ bookSourceUrl: url, bookSourceName: url, ...extra })
const res = (url, o = {}) => ({ source: src(url, o.source), ok: true, explore: true, ms: 1000, brand: '', ...o })

test('hostOf 去掉 www/m/wap 前缀', () => {
  assert.equal(hostOf('https://m.abc.com/x'), 'abc.com')
  assert.equal(hostOf('http://www.ABC.com:8080'), 'abc.com')
})

test('品牌各取 2 个，其余同站一个、不超过目标数', () => {
  const results = [
    res('https://a.fanqie.com', { brand: '番茄', ms: 3000, explore: false }),
    res('https://b.fanqie.com', { brand: '番茄', ms: 1000, explore: false }),
    res('https://c.fanqie.com', { brand: '番茄', ms: 500, explore: false }),
    res('https://x.com/1'),
    res('https://www.x.com/2'),
    res('https://z.com', { ok: false }),
    res('https://w.com')
  ]
  const urls = selectSources(results, { target: 4, brands: ['番茄'], history: {}, prevUrls: new Set() })
    .map((r) => r.source.bookSourceUrl)
  assert.equal(urls.length, 4)
  assert.equal(urls.filter((u) => u.includes('fanqie')).length, 2)
  assert.ok(urls.includes('https://c.fanqie.com') && urls.includes('https://b.fanqie.com'))
  assert.ok(!urls.includes('https://z.com'))
  assert.equal(urls.filter((u) => hostOf(u) === 'x.com').length, 1)
})

test('分层：发现可用的前 5 个为精选（品牌优先）排在最前，其余进换源池，发现不是必须', () => {
  const results = [
    ...['a', 'b', 'c', 'd', 'e', 'f'].map((h, i) => res(`https://${h}.com`, { ms: 1000 * (i + 1) })),
    res('https://qimao.com', { brand: '七猫', ms: 9000 }),
    res('https://nofind.com', { explore: false, ms: 100, coverage: 6 })
  ]
  const picked = selectSources(results, { target: 50, brands: ['七猫'], history: {}, prevUrls: new Set() })
  const featured = picked.filter((r) => r.tier === 'featured')
  assert.equal(featured.length, 5)
  assert.equal(featured[0].source.bookSourceUrl, 'https://qimao.com', '品牌优先进精选')
  assert.deepEqual(picked.slice(0, 5).map((r) => r.tier), Array(5).fill('featured'), '精选排在最前')
  assert.ok(picked.some((r) => r.source.bookSourceUrl === 'https://nofind.com' && r.tier === 'pool'), '无发现也能进换源池')
  assert.equal(picked.length, 8)
})

test('换源池按搜书覆盖面优先', () => {
  const results = [
    res('https://narrow.com', { explore: false, ms: 500, coverage: 1 }),
    res('https://wide.com', { explore: false, ms: 5000, coverage: 6 })
  ]
  const picked = selectSources(results, { target: 1, brands: [], history: {}, prevUrls: new Set() })
  assert.equal(picked[0].source.bookSourceUrl, 'https://wide.com')
})

test('上一版已发布且连续可用的书源优先于更快的新书源', () => {
  const results = [res('https://old.com', { ms: 8000 }), res('https://new.com', { ms: 500 })]
  const history = { 'https://old.com': { streak: 7 } }
  const picked = selectSources(results, { target: 1, brands: [], history, prevUrls: new Set(['https://old.com']) })
  assert.equal(picked[0].source.bookSourceUrl, 'https://old.com')
})

test('历史：可用累加、失败清零、30 天未出现删除', () => {
  const now = 100 * 86400000
  const h = updateHistory({
    'https://a.com': { streak: 2, fails: 0, lastSeen: now - 86400000 },
    'https://b.com': { streak: 5, fails: 0, lastSeen: now - 86400000 },
    'https://gone.com': { streak: 1, fails: 0, lastSeen: now - 40 * 86400000 }
  }, [res('https://a.com'), res('https://b.com', { ok: false })], now)
  assert.equal(h['https://a.com'].streak, 3)
  assert.equal(h['https://b.com'].streak, 0)
  assert.equal(h['https://b.com'].fails, 1)
  assert.ok(!('https://gone.com' in h))
})

test('变更清单标出新增、移除与 JS 变化', () => {
  const prev = [src('a', { ruleSearch: { name: '@js:1' } }), src('b'), src('c', { jsLib: 'x' })]
  const next = [src('a', { ruleSearch: { name: '@js:2' } }), src('c', { jsLib: 'x' }), src('d')]
  const d = diffSources(prev, next)
  assert.deepEqual(d.added.map((s) => s.url), ['d'])
  assert.deepEqual(d.removed.map((s) => s.url), ['b'])
  assert.deepEqual(d.jsChanged.map((s) => s.url), ['a'])
})

test('安全门', () => {
  assert.notEqual(publishable(4, 0), '')
  assert.equal(publishable(5, 0), '')
  assert.notEqual(publishable(20, 50), '')
  assert.equal(publishable(25, 50), '')
})

test('成人 / 同人向书源过滤', () => {
  assert.ok(excludedSource({ bookSourceName: '肉文屋' }))
  assert.ok(excludedSource({ bookSourceName: '七猫四合一本地版（同人）' }))
  assert.ok(excludedSource({ bookSourceName: '某站', bookSourceGroup: '🔞' }))
  assert.ok(excludedSource({ bookSourceName: '海棠文学城' }))
  assert.ok(!excludedSource({ bookSourceName: '番茄小说', bookSourceGroup: '官方,小说' }))
})

test('7 天内失败过且未成功的跳过', () => {
  const now = 100 * 86400000
  const h = {
    a: { streak: 0, fails: 2, lastSeen: now - 86400000 },
    b: { streak: 0, fails: 1, lastSeen: now - 8 * 86400000 },
    c: { streak: 3, fails: 0, lastSeen: now - 86400000 }
  }
  assert.ok(recentlyFailed(h, 'a', now))
  assert.ok(!recentlyFailed(h, 'b', now))
  assert.ok(!recentlyFailed(h, 'c', now))
  assert.ok(!recentlyFailed(h, 'none', now))
})

test('同一书源地址的多个版本只留得分最高的', () => {
  const r = (name, o) => ({ source: { bookSourceUrl: 'https://api.qimao.com', bookSourceName: name }, ok: true, explore: false, latestOk: true, ms: 5000, brand: '七猫', ...o })
  const picked = selectSources([r('慢版', { ms: 50000 }), r('快版', { ms: 2000 }), r('坏版', { ok: false })],
    { target: 10, brands: ['七猫'], history: {}, prevUrls: new Set() })
  assert.deepEqual(picked.map((p) => p.source.bookSourceName), ['快版'])
})

test('同名书源（同站不同域名）只留一个', () => {
  const r = (url, name, ms) => ({ source: { bookSourceUrl: url, bookSourceName: name }, ok: true, explore: false, latestOk: true, ms, brand: '' })
  const picked = selectSources([r('https://ixdzs8.com', '爱下电子书', 3000), r('https://ixdzs.tw/', '📖 爱下电子书', 1000), r('https://x.com', '别的', 2000)],
    { target: 10, brands: [], history: {}, prevUrls: new Set() })
  assert.deepEqual(picked.map((p) => p.source.bookSourceUrl).sort(), ['https://ixdzs.tw/', 'https://x.com'])
})
