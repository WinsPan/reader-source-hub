// 书源分发 Worker：带私密令牌的地址返回最新书源；检测器用上传令牌发布新版本
//   GET  /s/<READ_TOKEN>/sources.json | manifest.json | history.json
//   POST /admin/publish   Authorization: Bearer <UPLOAD_TOKEN>   body: { sources, manifest, history }
//   POST /admin/rollback  Authorization: Bearer <UPLOAD_TOKEN>   用上一版覆盖当前版本
//   POST /admin/history   Authorization: Bearer <UPLOAD_TOKEN>   body: { history }  只更新检测历史（本次未发布时）
// 存储：KV 命名空间 STORE，键 cur:<文件名> 与 prev:<文件名>

const FILES = ['sources.json', 'manifest.json', 'history.json']
const enc = new TextEncoder()

/** 定长比较，避免按耗时猜测令牌 */
async function sameSecret(a, b) {
  if (!a || !b) {
    return false
  }
  const [x, y] = await Promise.all([a, b].map((s) => crypto.subtle.digest('SHA-256', enc.encode(s))))
  return crypto.subtle.timingSafeEqual(x, y)
}

const notFound = () => new Response('Not Found', { status: 404 })

function json(body, status = 200) {
  return new Response(typeof body === 'string' ? body : JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-cache',
      'x-content-type-options': 'nosniff'
    }
  })
}

async function publish(request, env) {
  let payload
  try {
    payload = await request.json()
  } catch {
    return json({ error: 'invalid json' }, 400)
  }
  const { sources, manifest, history } = payload ?? {}
  if (!Array.isArray(sources) || sources.length === 0 || !manifest?.version) {
    return json({ error: 'sources / manifest missing' }, 400)
  }
  const current = await Promise.all(FILES.map((f) => env.STORE.get(`cur:${f}`)))
  // 先备份当前版本，再写新版本（manifest 最后写，客户端据它判断是否有新版）
  await Promise.all(FILES.map((f, i) => (current[i] === null ? null : env.STORE.put(`prev:${f}`, current[i]))))
  await env.STORE.put('cur:sources.json', JSON.stringify(sources))
  await env.STORE.put('cur:history.json', JSON.stringify(history ?? {}))
  await env.STORE.put('cur:manifest.json', JSON.stringify(manifest))
  return json({ ok: true, version: manifest.version, count: sources.length })
}

async function rollback(env) {
  const prev = await Promise.all(FILES.map((f) => env.STORE.get(`prev:${f}`)))
  if (prev.some((v) => v === null)) {
    return json({ error: 'no previous version' }, 409)
  }
  // 回滚出的版本号需大于当前，客户端才会重新拉取
  const manifest = JSON.parse(prev[1])
  manifest.version = Date.now()
  manifest.rolledBack = true
  await env.STORE.put('cur:sources.json', prev[0])
  await env.STORE.put('cur:history.json', prev[2])
  await env.STORE.put('cur:manifest.json', JSON.stringify(manifest))
  return json({ ok: true, version: manifest.version })
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const parts = url.pathname.split('/').filter(Boolean)

    if (parts[0] === 'admin' && request.method === 'POST' && parts.length === 2) {
      const auth = request.headers.get('authorization') ?? ''
      if (!(await sameSecret(auth.replace(/^Bearer\s+/i, ''), env.UPLOAD_TOKEN))) {
        return notFound()
      }
      if (parts[1] === 'publish') {
        return publish(request, env)
      }
      if (parts[1] === 'rollback') {
        return rollback(env)
      }
      if (parts[1] === 'history') {
        const body = await request.json().catch(() => null)
        if (!body || typeof body.history !== 'object') {
          return json({ error: 'history missing' }, 400)
        }
        await env.STORE.put('cur:history.json', JSON.stringify(body.history))
        return json({ ok: true })
      }
      return notFound()
    }

    if (parts[0] === 's' && parts.length === 3 && request.method === 'GET' && FILES.includes(parts[2])) {
      if (!(await sameSecret(parts[1], env.READ_TOKEN))) {
        return notFound()
      }
      const body = await env.STORE.get(`cur:${parts[2]}`)
      return body === null ? notFound() : json(body)
    }

    return notFound()
  }
}
