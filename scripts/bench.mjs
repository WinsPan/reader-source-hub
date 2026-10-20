// 对比用：用指定引擎严格检测一批本地书源（取 id 最大即最新的若干个，结果可复现，便于比较引擎改动前后）
// 用法：node scripts/bench.mjs <engine.mjs> <书源目录> <数量> <输出.json>
import fs from 'node:fs'
import path from 'node:path'
import { deepCheck } from '../checker/deep.mjs'
import { hostOf } from '../checker/select.mjs'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
for (const k of ['log', 'info', 'warn', 'error', 'debug']) {
  console[k] = () => {}
}
const [enginePath, dir, count, outFile] = process.argv.slice(2)
const E = await import(path.resolve(enginePath))
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort((a, b) => Number(b.split('.')[0]) - Number(a.split('.')[0]))
const sources = []
const hosts = new Set()
for (const f of files) {
  if (sources.length >= Number(count)) {
    break
  }
  let s
  try {
    s = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))[0]
  } catch {
    continue
  }
  if (!s?.bookSourceUrl || (s.bookSourceType ?? 0) !== 0 || hosts.has(hostOf(s.bookSourceUrl))) {
    continue
  }
  hosts.add(hostOf(s.bookSourceUrl))
  sources.push(s)
}
const started = Date.now()
const results = []
let i = 0
await Promise.all(Array.from({ length: 16 }, async () => {
  while (i < sources.length) {
    const s = sources[i++]
    const r = await deepCheck(E, s, '')
    results.push({ url: s.bookSourceUrl, name: s.bookSourceName, ok: r.ok, step: r.step, message: r.message, ms: r.ms, latestOk: r.latestOk, explore: r.explore })
    process.stdout.write(`\r${results.length}/${sources.length}`)
  }
}))
const ok = results.filter((r) => r.ok).length
const reasons = {}
results.filter((r) => !r.ok).forEach((r) => { reasons[r.step] = (reasons[r.step] ?? 0) + 1 })
fs.writeFileSync(outFile, JSON.stringify(results, null, 1))
process.stdout.write(`\n检测 ${results.length} · 可用 ${ok} · 用时 ${Math.round((Date.now() - started) / 1000)}s · 失效环节 ${JSON.stringify(reasons)}\n`)
process.exit(0)
