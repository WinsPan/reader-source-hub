import { test } from 'node:test'
import assert from 'node:assert/strict'
import { contentProblem, distinctContents, relevantHit, tocProblem } from '../checker/quality.mjs'
import { selectSources } from '../checker/select.mjs'

const novel = '他抬起头，看见远处的山峦在夕阳下泛着金光。'.repeat(30)

test('正文：正常、过短、锁章、乱码、字体混淆、非中文', () => {
  assert.equal(contentProblem(novel), '')
  assert.match(contentProblem('第一章 开始'), /过短/)
  assert.match(contentProblem('本章为VIP章节，请登录后订阅本章继续阅读'), /锁章/)
  assert.match(contentProblem(novel + '锟斤拷锟斤拷'), /乱码/)
  assert.match(contentProblem(novel.replace(/的/g, '')), /字体混淆/)
  assert.match(contentProblem('lorem ipsum dolor sit amet '.repeat(40)), /中文比例/)
  assert.equal(contentProblem(''), '正文为空')
})

test('长正文中偶尔出现“登录”不算锁章', () => {
  assert.equal(contentProblem(novel + '他登录了游戏。' + novel), '')
})

test('搜索相关性：书名规范化后匹配，完全相同优先', () => {
  const books = [
    { name: '斗破苍穹之无上之境', bookUrl: 'a' },
    { name: '《斗破苍穹》', bookUrl: 'b' },
    { name: '武动乾坤', bookUrl: 'c' }
  ]
  assert.equal(relevantHit(books, '斗破苍穹').bookUrl, 'b')
  assert.equal(relevantHit(books, '诡秘之主'), undefined)
})

test('目录：过短、地址重复、标题重复', () => {
  const ch = (n, f = (i) => ({ title: `第${i}章`, url: `u${i}` })) => Array.from({ length: n }, (_, i) => f(i))
  assert.equal(tocProblem(ch(50)), '')
  assert.match(tocProblem(ch(5)), /过短/)
  assert.match(tocProblem(ch(50, (i) => ({ title: `第${i}章`, url: 'same' }))), /地址/)
  assert.match(tocProblem(ch(50, (i) => ({ title: '目录', url: `u${i}` }))), /标题/)
  assert.equal(tocProblem([]), '目录为空')
})

test('不同章节内容相同视为异常', () => {
  assert.equal(distinctContents(['甲'.repeat(300), '乙'.repeat(300)]), true)
  assert.equal(distinctContents(['甲'.repeat(300), '甲'.repeat(300)]), false)
})

test('正文指纹相同的镜像站只留一个；不稳定的排在稳定的后面', () => {
  const r = (url, o) => ({ source: { bookSourceUrl: url }, ok: true, explore: true, latestOk: true, ms: 5000, brand: '', ...o })
  const picked = selectSources([
    r('https://a.com', { fingerprint: 'x' }),
    r('https://b.com', { fingerprint: 'x' }),
    r('https://c.com', { fingerprint: 'y', flaky: true }),
    r('https://d.com', { fingerprint: 'z' })
  ], { target: 10, brands: [], history: {}, prevUrls: new Set() }).map((p) => p.source.bookSourceUrl)
  assert.deepEqual(picked.slice().sort(), ['https://a.com', 'https://c.com', 'https://d.com'])
  assert.equal(picked[picked.length - 1], 'https://c.com')
})
