// 把检测结果发布到 Worker
// 环境变量：HUB_URL（Worker 地址）、UPLOAD_TOKEN
import fs from 'node:fs'
import path from 'node:path'

const dir = process.argv[2] ?? 'dist'
const { HUB_URL, UPLOAD_TOKEN } = process.env
if (!HUB_URL || !UPLOAD_TOKEN) {
  throw new Error('缺少 HUB_URL / UPLOAD_TOKEN')
}
const read = (f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))
const res = await fetch(`${HUB_URL.replace(/\/$/, '')}/admin/publish`, {
  method: 'POST',
  headers: { authorization: `Bearer ${UPLOAD_TOKEN}`, 'content-type': 'application/json' },
  body: JSON.stringify({ sources: read('sources.json'), manifest: read('manifest.json'), history: read('history.json') })
})
const text = await res.text()
if (!res.ok) {
  throw new Error(`发布失败：HTTP ${res.status}`)
}
const r = JSON.parse(text)
console.log(`已发布：版本 ${r.version}，${r.count} 个书源`)
