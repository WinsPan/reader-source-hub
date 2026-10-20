import { test } from 'node:test'
import assert from 'node:assert/strict'
import { diffSources, hostOf, publishable, selectSources, updateHistory } from '../checker/select.mjs'

const src = (url, extra = {}) => ({ bookSourceUrl: url, bookSourceName: url, ...extra })
const res = (url, o = {}) => ({ source: src(url, o.source), ok: true, explore: true, ms: 1000, brand: '', ...o })

test('hostOf 去掉 www/m/wap 前缀', () => {
  assert.equal(hostOf('https://m.abc.com/x'), 'abc.com')
  assert.equal(hostOf('http://www.ABC.com:8080'), 'abc.com')
})

test('品牌各取 2 个，其余要求发现可用、同站一个、不超过目标数', () => {
  const results = [
    res('https://a.fanqie.com', { brand: '番茄', ms: 3000 }),
    res('https://b.fanqie.com', { brand: '番茄', ms: 1000 }),
    res('https://c.fanqie.com', { brand: '番茄', ms: 500 }),
    res('https://x.com/1'),
    res('https://www.x.com/2'),
    res('https://y.com', { explore: false }),
    res('https://z.com', { ok: false }),
    res('https://w.com'),
    res('https://v.com')
  ]
  const picked = selectSources(results, { target: 4, brands: ['番茄'], history: {}, prevUrls: new Set() })
  const urls = picked.map((r) => r.source.bookSourceUrl)
  assert.deepEqual(urls.slice(0, 2), ['https://c.fanqie.com', 'https://b.fanqie.com'])
  assert.equal(urls.length, 4)
  assert.ok(!urls.includes('https://y.com') && !urls.includes('https://z.com'))
  assert.equal(urls.filter((u) => hostOf(u) === 'x.com').length, 1)
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
  assert.notEqual(publishable(19, 0), '')
  assert.equal(publishable(20, 0), '')
  assert.notEqual(publishable(20, 50), '')
  assert.equal(publishable(30, 50), '')
})
