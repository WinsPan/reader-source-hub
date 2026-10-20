// HarmonyOS Kit 的 Node 垫片：只实现客户端书源引擎实际用到的接口
import crypto from 'node:crypto'
import nodeFs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

// ---------- @kit.NetworkKit ----------
export const http = {
  RequestMethod: { GET: 'GET', POST: 'POST', PUT: 'PUT', HEAD: 'HEAD', DELETE: 'DELETE' },
  HttpDataType: { STRING: 0, OBJECT: 1, ARRAY_BUFFER: 2 },
  createHttp() {
    return {
      async request(url, opts = {}) {
        const timeout = Math.max(opts.connectTimeout ?? 0, opts.readTimeout ?? 0) || 30000
        const res = await fetch(url, {
          method: opts.method || 'GET',
          headers: opts.header || {},
          body: opts.extraData === undefined || opts.method === 'GET' ? undefined : opts.extraData,
          redirect: 'follow',
          signal: AbortSignal.timeout(timeout)
        })
        const header = {}
        res.headers.forEach((v, k) => { header[k] = v })
        return { responseCode: res.status, header, result: await res.arrayBuffer() }
      },
      destroy() {}
    }
  }
}

// ---------- @kit.ArkTS ----------
export const util = {
  TextEncoder: class {
    encodeInto(s) { return new TextEncoder().encode(s ?? '') }
  },
  TextDecoder: {
    create(label, opts) {
      const td = new TextDecoder(label, { ignoreBOM: opts?.ignoreBOM ?? false })
      return { decodeWithStream: (b) => td.decode(b), decodeToString: (b) => td.decode(b) }
    }
  },
  Base64Helper: class {
    decodeSync(s) { return new Uint8Array(Buffer.from(typeof s === 'string' ? s : Buffer.from(s).toString(), 'base64')) }
    encodeToStringSync(b) { return Buffer.from(b).toString('base64') }
  }
}

// ---------- @kit.CryptoArchitectureKit ----------
const hashName = (alg) => alg.toLowerCase()
function cipherName(spec) {
  // 例：AES128|CBC|PKCS7、3DES192|ECB|NoPadding
  const [keyAlg, block] = spec.split('|')
  if (keyAlg.startsWith('AES')) {
    return `aes-${keyAlg.slice(3)}-${block.toLowerCase()}`
  }
  return block.toUpperCase() === 'ECB' ? 'des-ede3' : `des-ede3-${block.toLowerCase()}`
}
export const cryptoFramework = {
  CryptoMode: { ENCRYPT_MODE: 0, DECRYPT_MODE: 1 },
  createMd(alg) {
    const h = crypto.createHash(hashName(alg))
    return {
      updateSync(b) { h.update(b.data) },
      digestSync() { return { data: new Uint8Array(h.digest()) } }
    }
  },
  createSymKeyGenerator() {
    return { convertKeySync(b) { return { data: Buffer.from(b.data) } } }
  },
  createMac(alg) {
    let h = null
    return {
      initSync(key) { h = crypto.createHmac(hashName(alg), key.data) },
      updateSync(b) { h.update(b.data) },
      doFinalSync() { return { data: new Uint8Array(h.digest()) } }
    }
  },
  createCipher(spec) {
    const padding = !spec.endsWith('NoPadding')
    let c = null
    return {
      initSync(mode, key, ivSpec) {
        const name = cipherName(spec)
        const iv = ivSpec ? Buffer.from(ivSpec.iv.data) : null
        c = mode === 0 ? crypto.createCipheriv(name, key.data, iv) : crypto.createDecipheriv(name, key.data, iv)
        c.setAutoPadding(padding)
      },
      doFinalSync(b) { return { data: new Uint8Array(Buffer.concat([c.update(b.data), c.final()])) } }
    }
  }
}

// ---------- @kit.ArkData / @ohos.data.preferences ----------
function memoryPreferences() {
  const m = new Map()
  return {
    getSync: (k, d) => (m.has(k) ? m.get(k) : d),
    putSync: (k, v) => { m.set(k, v) },
    hasSync: (k) => m.has(k),
    deleteSync: (k) => { m.delete(k) },
    flush: () => Promise.resolve(),
    flushSync: () => {}
  }
}
const prefStores = new Map()
export const preferences = {
  getPreferencesSync(_ctx, opts) {
    const name = opts?.name ?? ''
    if (!prefStores.has(name)) {
      prefStores.set(name, memoryPreferences())
    }
    return prefStores.get(name)
  }
}
export const unifiedDataChannel = {}
export default preferences

// ---------- @kit.CoreFileKit ----------
export const fileIo = {
  OpenMode: { READ_ONLY: 0, WRITE_ONLY: 1, READ_WRITE: 2, CREATE: 0o100, TRUNC: 0o1000, APPEND: 0o2000 },
  accessSync: (p) => nodeFs.existsSync(p),
  mkdirSync: (p, recursive) => nodeFs.mkdirSync(p, { recursive: !!recursive }),
  readTextSync: (p) => nodeFs.readFileSync(p, 'utf8'),
  openSync: (p) => ({ fd: nodeFs.openSync(p, 'w') }),
  writeSync: (fd, text) => nodeFs.writeSync(fd, text),
  closeSync: (f) => nodeFs.closeSync(typeof f === 'number' ? f : f.fd),
  unlinkSync: (p) => nodeFs.rmSync(p, { force: true }),
  rmdirSync: (p) => nodeFs.rmSync(p, { recursive: true, force: true }),
  listFileSync: (p) => (nodeFs.existsSync(p) ? nodeFs.readdirSync(p) : [])
}

// ---------- @pura/harmony-utils ----------
const workDir = nodeFs.mkdtempSync(path.join(os.tmpdir(), 'source-hub-'))
export const AppUtil = {
  getContext: () => ({ filesDir: workDir, cacheDir: workDir })
}

// ---------- 其余 Kit：引擎只引用其类型 ----------
export const bookParser = {}
export const readerCore = {}
export const pasteboard = {}
// 常量文件引用了界面动画与数据库模块：任意属性都返回空函数 / 空对象
const inert = new Proxy(function () { return {} }, { get: (t, k) => (k === 'then' ? undefined : inert), apply: () => ({}) })
export const relationalStore = inert
export const curves = inert
