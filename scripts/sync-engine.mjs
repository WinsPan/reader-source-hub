// 把客户端（reader 仓库）的书源检测引擎打包成 vendor/engine.mjs，HarmonyOS 模块替换为 shims/ 下的 Node 垫片。
// 用法：node scripts/sync-engine.mjs [客户端 ets 目录]，默认 ../harmony-legado/entry/src/main/ets
import { build } from 'esbuild'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const ets = path.resolve(process.argv[2] ?? path.join(root, '../harmony-legado/entry/src/main/ets'))
const kit = path.join(root, 'shims/kit.mjs')
const stub = path.join(root, 'shims/stub.mjs')

const shimPlugin = {
  name: 'harmony-shims',
  setup(b) {
    b.onResolve({ filter: /^(@kit\.|@ohos\.|@pura\/harmony-utils$)/ }, () => ({ path: kit }))
    b.onResolve({ filter: /^libjsengine\.so$/ }, () => ({ path: path.join(root, 'shims/jsengine.mjs') }))
    b.onResolve({ filter: /database\/dao\/|componets\// }, () => ({ path: stub }))
  }
}

await build({
  stdin: {
    contents: `
      export { checkSource, CheckResult, BRANDS } from './common/utils/SourceCurator'
      export { searchRepoSources, searchRepoBoth, rankRepoSources, fetchRepoSource } from './common/utils/SourceRepo'
      export { SourceImporter } from './common/utils/SourceImporter'
      export { searchBooks, parseExploreUrl, exploreBooks } from './common/utils/OnlineBookSource'
      export { fetchBookInfo, fetchChapterList, fetchChapterContent } from './common/utils/OnlineReader'
      export { Books } from './database/entities/Books'
    `,
    resolveDir: ets,
    loader: 'ts'
  },
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node22',
  outfile: path.join(root, 'vendor/engine.mjs'),
  loader: { '.ets': 'ts' },
  resolveExtensions: ['.ets', '.ts', '.mjs', '.js'],
  external: ['quickjs-emscripten'],
  tsconfigRaw: { compilerOptions: { experimentalDecorators: true, useDefineForClassFields: false } },
  banner: {
    js: [
      '// 由 scripts/sync-engine.mjs 从客户端源码生成，请勿手改。GPL-3.0',
      'const __decorator = () => (t) => t;',
      'globalThis.Observed ??= (t) => t; globalThis.Track ??= () => {}; globalThis.Sendable ??= (t) => t;',
      'globalThis.AppStorage ??= { _m: new Map(), get(k) { return this._m.get(k) }, set(k, v) { this._m.set(k, v) }, setOrCreate(k, v) { this._m.set(k, v) } };'
    ].join('\n')
  },
  plugins: [shimPlugin],
  logLevel: 'warning'
})
console.log(`已生成 vendor/engine.mjs（来源：${ets}）`)
