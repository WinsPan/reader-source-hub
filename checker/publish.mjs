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
const post = async (endpoint, body) => {
  const res = await fetch(`${HUB_URL.replace(/\/$/, '')}/admin/${endpoint}`, {
    method: 'POST',
    headers: { authorization: `Bearer ${UPLOAD_TOKEN}`, 'content-type': 'application/json' },
    body: JSON.stringify(body)
  })
  if (!res.ok) {
    throw new Error(`${endpoint} 失败：HTTP ${res.status}`)
  }
  return res.json()
}
// 未通过安全门时没有 sources.json：只保存历史，下次据此跳过近期失败的书源
if (!fs.existsSync(path.join(dir, 'sources.json'))) {
  await post('history', { history: read('history.json') })
  console.log('本次未发布书源，已保存检测历史')
} else {
  const r = await post('publish', { sources: read('sources.json'), manifest: read('manifest.json'), history: read('history.json') })
  console.log(`已发布：版本 ${r.version}，${r.count} 个书源`)
}
