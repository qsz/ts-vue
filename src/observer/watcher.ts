import Dep, { pushTarget, popTarget } from './dep'
import Tsue from '../instance'
import { nextTick } from '../utils'

let wid = 0
interface WatchOptions {
    user?: boolean;
    lazy?: boolean;
    sync?: boolean
}
// 观察者
export default class Watcher {
    user: boolean;       // 用户自定义的watcher user = true
    lazy: boolean;       // 有计算属性的watcher lazy = true
    sync: boolean;       // true： 同步执行回调函数
    getter: Function;
    vm: Tsue;           // Tsue实例
    id: number = ++wid;  // watcher唯一id
    cb: Function;        // 回调函数
    dirty: boolean;

    depIds: Set<any> = new Set();    // Watcher关联的Dep实例id数组
    deps: Dep[] = [];         // Watcher关联的Dep实例数组

    value: any;         // expOrFn返回值
    constructor(vm: Tsue, expOrFn: Function | string, cb: Function, options: WatchOptions) {
        if (options) {
            this.user = !!options.user       
            this.lazy = !!options.lazy       
            this.sync = !!options.sync        
        } else {
            this.user = this.lazy = this.sync = false
        }
        this.dirty = this.lazy 
        if(typeof expOrFn === 'function') {
            this.getter = expOrFn // 实例化watcher的时候执行的方法
        } else {
            this.getter = function() {
                return vm[expOrFn]
            }
        }
        this.vm = vm          // Tsue实例
        this.cb = cb          // 回调函数
        this.vm = vm
        // 是否是 有计算属性的watcher，是则不执行 this.get()，所以此时不会设置当前观察者
        this.value = this.lazy ? undefined: this.get()
    }
    // 设置当前观察者，执行expOrFn，并返回expOrFn()的值
    get() {
        pushTarget(this) // 设置当前观察者
        let value;
        const vm = this.vm
        value = this.getter.call(vm, vm)
        popTarget()     // 移除当前观察者
        return value
    }
    // 把当前的 watcher 订阅到 dep 的 订阅收集列表中
    addDep(dep: Dep) {
        const id = dep.id // 唯一值
        if (!this.depIds.has(id)) { 
            this.depIds.add(id)
            this.deps.push(dep)
            // 把当前的 watcher 订阅到 dep 的 订阅收集列表中
            dep.addSub(this)
        }
    }
    // 数据更新的时候执行
    update() {
        if (this.lazy) {
            // 如果为计算属性的watcher 
            this.dirty = true
          } else if (this.sync) {
            // 同步执行
            this.run()
          } else {
            // 异步执行，queueWatcher 最终也会执行 run()
            queueWatcher(this)
        }
    }
    // 数据更新的时候最终执行的方法
    run() {
        const value = this.get();
        if(value !== this.value) { // 如果新值和旧值不相等
            const oldValue = this.value
            this.value = value
            if (this.user) {  
               // 用户自定义的wtcher，传入了value, oldValue。
               // 所以在自定义watcher中，我们可以拿到新值和旧值
               this.cb.call(this.vm, value, oldValue)
            } else {
               this.cb.call(this.vm, value, oldValue)
            }
        }
    }
    // 将Dep当前的观察者添加到关联的订阅收集者中
    depend() {
        let i = this.deps.length
        while (i--) {
            this.deps[i].depend()
        }
    }
    // 获取watcher的值
    evaluate() {
        this.value = this.get()
        this.dirty = false
    }
}

const queue: Watcher[] = []
const hasIds = new Set()
let waiting: boolean = false
/**
 * 异步执行队列
 * 为了提高性能，不会在每次数据更新的之后立即执行，而是会把所有的回调函数放到队列里
 * 最后调用nextTick在下一个事件循环中执行
 * @param watcher 
 */
function queueWatcher(watcher: Watcher) {
    const id = watcher.id
    if(!hasIds.has(id)) {
        hasIds.add(id)
        // 将watcher添加到队列中
        queue.push(watcher)
    }
    if (!waiting) {
        waiting = true
        nextTick(flushQueue)
    }
}

// 依次执行 watcher
function flushQueue() {
    let watcher: Watcher;
    let id: number;

    // 将watcher按创建顺序排序
    queue.sort((a, b) => a.id - b.id);

    for (let index = 0; index < queue.length; index++) {
        watcher = queue[index]
        id = watcher.id
        hasIds.delete(id)
        watcher.run()
    }

    // 重置
    waiting = false
    hasIds.clear()
    queue.length = 0
}