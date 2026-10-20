// 调试用：严格检测单个书源并打印引擎日志
// 用法：node scripts/check-one.mjs <源仓库 id | 书源 JSON 文件>
import fs from 'node:fs'
import { deepCheck } from '../checker/deep.mjs'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
// TRACE=1 时打印书源 JS 日志与实际发出的请求
if (process.env.TRACE) {
  const out = (x) => process.stdout.write(`${x}\n`)
  console.info = (m) => { if (`${m}`.includes('[书源JS]')) out(`${m}`.slice(0, 600)) }
  console.log = () => {}
  const realFetch = globalThis.fetch
  globalThis.fetch = async (u, o) => {
    const r = await realFetch(u, o)
    if (!`${u}`.includes('yckceo.com')) {
      out(`请求 ${o?.method ?? 'GET'} ${`${u}`.slice(0, 200)} → ${r.status} ${(await r.clone().text()).slice(0, 300).replace(/\s+/g, ' ')}`)
    }
    return r
  }
}
const E = await import('../vendor/engine.mjs')
const arg = process.argv[2]
const sources = fs.existsSync(arg) ? E.SourceImporter.parseText(fs.readFileSync(arg, 'utf8')) : await E.fetchRepoSource(arg)
for (const s of sources) {
  const r = await deepCheck(E, s, E.BRANDS.find((b) => s.bookSourceName.includes(b)) ?? '')
  const { source, ...rest } = r
  console.log(`\n== ${s.bookSourceName}`, JSON.stringify(rest, null, 1))
}
process.exit(0)
