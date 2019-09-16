// 给对象添加属性
export function def (obj: Object, key: string, val: any, enumerable?: boolean) {
    Object.defineProperty(obj, key, {
      value: val,
      enumerable: !!enumerable,
      writable: true,
      configurable: true
    })
}

export function isObject (obj: any) {
  return (obj !== null) && (typeof obj === 'object')
}

export function noop() {
  // TODO
}


const callbacks: Function[] = []
let pending = false

const timerFunc = () => {
  const p = Promise.resolve().then(flushCallbacks)
}

/**
 * 遍历callbacks，并执行回调函数
 */
function flushCallbacks () {
  pending = false
  const copies = callbacks.slice(0)
  callbacks.length = 0 // 清空callbacks
  for (let i = 0; i < copies.length; i++) {
    copies[i]()
  }
}

/**
 * 把同一时间的cb放入callbacks中，在下一个事件循环中一起执行
 * @param cb 
 */
export function nextTick(cb: Function) {
  callbacks.push(() => {
    cb()
  })
  if (!pending) {
    pending = true
    timerFunc()
  }
}