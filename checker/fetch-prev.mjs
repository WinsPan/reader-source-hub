// 取上一版发布内容到 prev/（首次运行时不存在，跳过）
// 环境变量：HUB_URL（Worker 地址）、READ_TOKEN
import fs from 'node:fs'
import path from 'node:path'

const out = process.argv[2] ?? 'prev'
const UA = 'reader-source-hub/1.0 (+https://github.com/WinsPan/reader-source-hub)'
const { HUB_URL, READ_TOKEN } = process.env
if (!HUB_URL || !READ_TOKEN) {
  console.log('未配置 HUB_URL / READ_TOKEN，跳过')
  process.exit(0)
}
fs.mkdirSync(out, { recursive: true })
for (const f of ['sources.json', 'manifest.json', 'history.json']) {
  const res = await fetch(`${HUB_URL.replace(/\/$/, '')}/s/${READ_TOKEN}/${f}`, { headers: { 'user-agent': UA } })
  if (res.status === 404) {
    console.log(`${f}：暂无上一版`)
    continue
  }
  if (!res.ok) {
    // 打印响应头便于判断是否被 Cloudflare 安全防护拦截（不含令牌）
    console.log(`server=${res.headers.get('server')} cf-mitigated=${res.headers.get('cf-mitigated')} cf-ray=${res.headers.get('cf-ray')}`)
    throw new Error(`${f}：HTTP ${res.status}`)
  }
  fs.writeFileSync(path.join(out, f), await res.text())
  console.log(`${f}：已取得`)
}
