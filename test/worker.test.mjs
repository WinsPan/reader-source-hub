import { test } from 'node:test'
import assert from 'node:assert/strict'
import worker from '../worker/src/index.js'

// Workers 专有的 timingSafeEqual 在 Node 中补上
crypto.subtle.timingSafeEqual ??= (a, b) => Buffer.from(a).equals(Buffer.from(b))

function env() {
  const m = new Map()
  return {
    READ_TOKEN: 'r-secret',
    UPLOAD_TOKEN: 'u-secret',
    STORE: { get: async (k) => (m.has(k) ? m.get(k) : null), put: async (k, v) => { m.set(k, v) } }
  }
}
const req = (path, init) => new Request(`https://hub.test${path}`, init)
const publish = (e, token, body) => worker.fetch(req('/admin/publish', {
  method: 'POST', headers: { authorization: `Bearer ${token}` }, body: JSON.stringify(body)
}), e)

test('令牌错误一律 404', async () => {
  const e = env()
  assert.equal((await worker.fetch(req('/s/wrong/sources.json'), e)).status, 404)
  assert.equal((await publish(e, 'wrong', { sources: [{}], manifest: { version: 1 } })).status, 404)
  assert.equal((await worker.fetch(req('/'), e)).status, 404)
})

test('发布后可读取，再次发布保留上一版并可回滚', async () => {
  const e = env()
  assert.equal((await worker.fetch(req('/s/r-secret/sources.json'), e)).status, 404)
  assert.equal((await publish(e, 'u-secret', { sources: [{ a: 1 }], manifest: { version: 1 }, history: {} })).status, 200)
  assert.deepEqual(await (await worker.fetch(req('/s/r-secret/sources.json'), e)).json(), [{ a: 1 }])
  await publish(e, 'u-secret', { sources: [{ a: 2 }], manifest: { version: 2 }, history: {} })
  assert.deepEqual(await (await worker.fetch(req('/s/r-secret/sources.json'), e)).json(), [{ a: 2 }])
  const rb = await worker.fetch(req('/admin/rollback', { method: 'POST', headers: { authorization: 'Bearer u-secret' } }), e)
  assert.equal(rb.status, 200)
  assert.deepEqual(await (await worker.fetch(req('/s/r-secret/sources.json'), e)).json(), [{ a: 1 }])
  const m = await (await worker.fetch(req('/s/r-secret/manifest.json'), e)).json()
  assert.ok(m.version > 2 && m.rolledBack)
})

test('拒绝空书源', async () => {
  const e = env()
  assert.equal((await publish(e, 'u-secret', { sources: [], manifest: { version: 1 } })).status, 400)
})
