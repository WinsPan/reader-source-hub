// libjsengine.so 的 Node 实现：书源 JS 在 QuickJS（WebAssembly）沙箱中执行，接触不到 Node 进程。
// 与客户端原生实现一致：先执行 prelude，再 __init(bindings)、执行脚本、__out(结果)；
// __host 在沙箱内是同步调用，宿主侧异步完成（asyncify）。
import { newQuickJSAsyncWASMModule } from 'quickjs-emscripten'

const SCRIPT_TIMEOUT_MS = 60000
const MEMORY_LIMIT = 128 * 1024 * 1024

// asyncify 模块同一时刻只能挂起一次调用，并发 / 嵌套执行时各占一个运行时，用完放回池中复用。
// 运行时长期保留（每次只新建上下文）：销毁运行时会让 quickjs-emscripten 内部的宿主函数引用失效
const idle = []

async function acquire() {
  const reused = idle.pop()
  if (reused) {
    return reused
  }
  const rt = (await newQuickJSAsyncWASMModule()).newRuntime()
  rt.setMemoryLimit(MEMORY_LIMIT)
  rt.setMaxStackSize(4 * 1024 * 1024)
  const slot = { rt, deadline: 0, host: null, contexts: new Map() }
  rt.setInterruptHandler(() => Date.now() > slot.deadline)
  return slot
}

function errorText(vm, handle) {
  const e = vm.dump(handle)
  handle.dispose()
  if (typeof e !== 'object' || e === null) {
    return `${e}`
  }
  // QuickJS 的报错不带函数名，附上调用栈首行便于定位
  const at = `${e.stack ?? ''}`.split('\n').find((l) => l.trim().startsWith('at ')) ?? ''
  return `${e.message ?? JSON.stringify(e)}${at ? ` (${at.trim()})` : ''}`
}

// 与客户端一致：已执行过 prelude（含书源 jsLib）的上下文按 prelude 缓存复用，免去每次重新编译
const CONTEXT_CACHE_MAX = 4

function contextFor(slot, prelude) {
  let entry = slot.contexts.get(prelude)
  if (entry) {
    slot.contexts.delete(prelude)
    slot.contexts.set(prelude, entry)
    return entry
  }
  const vm = slot.rt.newContext()
  // 宿主函数按当前调用分派（同一上下文会被不同的 evaluate 复用）
  const hostFn = vm.newAsyncifiedFunction('__host', async (m, a) => {
    const method = vm.getString(m)
    const args = vm.getString(a)
    try {
      const r = await slot.host(method, args)
      return vm.newString(r === undefined || r === null ? '' : `${r}`)
    } catch (e) {
      return { error: vm.newError(`${e?.message ?? e}`) }
    }
  })
  vm.setProp(vm.global, '__host', hostFn)
  hostFn.dispose()
  entry = { vm, ready: false }
  slot.contexts.set(prelude, entry)
  if (slot.contexts.size > CONTEXT_CACHE_MAX) {
    const [oldKey, old] = slot.contexts.entries().next().value
    slot.contexts.delete(oldKey)
    old.vm.dispose()
  }
  return entry
}

function dropContext(slot, prelude) {
  const entry = slot.contexts.get(prelude)
  if (entry) {
    slot.contexts.delete(prelude)
    entry.vm.dispose()
  }
}

export async function evaluate(prelude, script, bindings, host) {
  const slot = await acquire()
  slot.deadline = Date.now() + SCRIPT_TIMEOUT_MS
  slot.host = host
  const entry = contextFor(slot, prelude)
  const vm = entry.vm
  const run = async (code) => {
    const r = await vm.evalCodeAsync(code)
    if (r.error) {
      throw new Error(errorText(vm, r.error))
    }
    return r.value
  }
  const call = (name, arg) => {
    const fn = vm.getProp(vm.global, name)
    const r = vm.callFunction(fn, vm.undefined, arg)
    fn.dispose()
    if (r.error) {
      throw new Error(errorText(vm, r.error))
    }
    return r.value
  }
  try {
    if (!entry.ready) {
      ;(await run(prelude)).dispose()
      entry.ready = true
    }
    const b = vm.newString(bindings)
    call('__init', b).dispose()
    b.dispose()
    const value = await run(script)
    const out = call('__out', value)
    value.dispose()
    const text = vm.getString(out)
    out.dispose()
    return text
  } catch (e) {
    // 超时或内存超限后上下文状态不可信，丢弃
    if (!entry.ready || /interrupted|out of memory/i.test(e.message)) {
      dropContext(slot, prelude)
    }
    throw e
  } finally {
    slot.host = null
    idle.push(slot)
  }
}
