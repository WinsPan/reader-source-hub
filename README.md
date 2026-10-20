# reader-source-hub

每天严格检测 yckceo.com 源仓库的书源，保留至多 50 个真正能读的，通过 Cloudflare Worker 提供给「阅读」客户端订阅、自动拉取。

```
GitHub Actions（每天北京时间 03:00）
  取上一版 → 检测（搜索 / 发现 / 详情 / 目录 / 正文 全链路）→ 选出 ≤50 个 → 发布
                                                          │
Cloudflare Worker + KV  ◀─────────────────────────────────┘
  GET /s/<READ_TOKEN>/sources.json   ← 客户端订阅地址
  GET /s/<READ_TOKEN>/manifest.json  ← 版本号、变更清单（新增 / 移除 / JS 变更）
```

- **解析与客户端一致，判定更严：** `vendor/engine.mjs` 由客户端自己的解析代码打包而来（`scripts/sync-engine.mjs`），HarmonyOS 模块替换为 `shims/` 下的 Node 垫片；书源在客户端里怎么解析，这里就怎么解析。判定由 `checker/deep.mjs` 负责，比客户端严格：多关键词搜索相关性、目录质量、第一章 / 中间章 / 最新章三处正文抽样（字数、乱码、字体混淆、锁章与反爬页）、失败复检、镜像站去重。
- **两层结果：** 精选 5 个（发现、搜索、阅读全部可用，七猫 / 番茄 / 猫眼优先，发现页只显示它们）；其余为换源池（只要求搜索与阅读，按搜书覆盖面、稳定性、速度排序，默认关闭发现，用于搜书与换源）。三个品牌各保留 2 个。
- **逐日累积：** 每天最多检测 3 小时；已发布的书源每天复检，7 天内失败过的候选跳过，把时间留给新候选。成人 / 同人向书源不入选。
- **书源 JS 在沙箱中执行：** 运行在 QuickJS（WebAssembly）里，接触不到 Node 进程；检测步骤运行时没有任何密钥。
- **公开日志不泄露：** 只打印统计数字，不打印书源名称和地址。本地加 `--verbose` 可看逐个结果。
- **数量与安全门：** 最多 50 个；入选不足 5 个，或不到上一版的一半时，不发布书源（只保存检测历史），保留上一版。

## 部署（一次性）

1. 安装依赖：`npm install`
2. 登录 Cloudflare：`npx wrangler login`
3. 创建 KV：`npx wrangler kv namespace create STORE`，把返回的 id 填进 `worker/wrangler.toml`。
4. 生成两个随机令牌（例如 `openssl rand -hex 24`），设为 Worker 密钥并部署：
   ```
   cd worker
   npx wrangler secret put READ_TOKEN
   npx wrangler secret put UPLOAD_TOKEN
   npx wrangler deploy
   ```
5. **自定义域名（建议）：** `workers.dev` 在大陆访问不稳定。取消 `wrangler.toml` 里 `routes` 的注释后重新部署。
6. 在本仓库 Settings → Secrets → Actions 添加 `HUB_URL`、`READ_TOKEN`、`UPLOAD_TOKEN`。`HUB_URL` 用 `workers.dev` 地址：自定义域名受该域名的 Cloudflare 安全防护（如 Bot Fight Mode）影响，会给 GitHub 的数据中心 IP 返回人机验证（`cf-mitigated: challenge`）；手机订阅仍用自定义域名。
7. 在 Actions 页面手动运行一次（daily-check → Run workflow）。
8. 客户端：书源管理 → 右上角菜单 → 书源订阅，添加 `https://<域名>/s/<READ_TOKEN>/sources.json`。

## 本地运行

```
node checker/main.mjs --out dist --verbose      # 只检测，结果写到 dist/
HUB_URL=... UPLOAD_TOKEN=... node checker/publish.mjs dist
```

回滚到上一版：

```
curl -X POST -H "Authorization: Bearer $UPLOAD_TOKEN" $HUB_URL/admin/rollback
```

## 调试

```
node scripts/check-one.mjs <源仓库 id>          # 严格检测单个书源（TRACE=1 打印请求与书源 JS 日志）
node scripts/trace-search.mjs <源仓库 id> [关键词] # 追踪搜索请求与书源 JS 报错
```

## 更新引擎

客户端解析引擎改动后，在本仓库运行（客户端仓库需在同级目录）：

```
npm run sync-engine            # 默认读取 ../harmony-legado/entry/src/main/ets
npm test
```

然后提交 `vendor/engine.mjs`。

## 说明

- 检测结果反映的是 GitHub runner（海外）的网络。这里通过的书源在手机网络下不一定可用，反之亦然。
- `manifest.json` 会列出 JS 有变化的书源，依赖这些书源前请先看一眼。
- 许可：GPL-3.0，与客户端相同。
