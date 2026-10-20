// 调试用：执行书源搜索，打印书源 JS 里出错的调用栈与实际发出的请求
// 用法：node scripts/trace-search.mjs <源仓库 id> [关键词]
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
const out = (x) => process.stdout.write(`${x}\n`)
console.info = (m) => { if (`${m}`.includes('[书源JS]')) out(`${m}`.slice(0, 800)) }
console.warn = (m) => out(`警告 ${`${m}`.slice(0, 400)}`)
console.log = () => {}
const realFetch = globalThis.fetch
globalThis.fetch = async (u, o) => {
  const r = await realFetch(u, o)
  if (!`${u}`.includes('yckceo.com')) {
    out(`请求 ${o?.method ?? 'GET'} ${`${u}`.slice(0, Number(process.env.URL_LEN ?? 160))} → ${r.status} ${(await r.clone().text()).slice(0, Number(process.env.BODY_LEN ?? 160)).replace(/\s+/g, ' ')}`)
  }
  return r
}
const E = await import('../vendor/engine.mjs')
const [s] = await E.fetchRepoSource(process.argv[2])
const key = process.argv[3] ?? '斗破苍穹'
const raw = s.searchUrl
// 先单独执行搜索地址，拿到书源 JS 的报错栈
if (/^\s*(@js:|<js>)/.test(raw)) {
  const code = raw.trim().replace(/^@js:/, '').replace(/^<js>|<\/js>$/g, '')
  s.searchUrl = `@js: try { ${code} } catch (e) { java.log("搜索地址出错 " + e + " " + (e && e.stack)); "" }`
}
try {
  const books = await E.searchBooks(s, key, 1)
  out(`结果 ${books.length}：${books.slice(0, 5).map((b) => b.name).join('、')}`)
} catch (e) {
  out(`异常 ${e.message}`)
}
process.exit(0)
