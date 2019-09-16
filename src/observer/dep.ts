import Watcher from './watcher'

let uid = 0
// 发布者，订阅收集
export default class Dep {
    static target: Watcher  // 当前观察者。不同的观察者做的事情不同
    id: number              // 每个dep的序号
    subs: Watcher[]         // 数组，watcher实例 
    constructor () {
        this.id = uid++
        this.subs = []
    }

    /**
     * 收集订阅
     * @param sub： Watcher实例
     */
    addSub (sub: Watcher) {
        this.subs.push(sub)
    }

    /**
     * 每个对象值的 getter 都持有一个 dep
     * 在触发 getter 的时候会调用 dep.depend() 方法，也就会执行 Watcher.addDep(this)。用来收集依赖，这样notify() 能够通知到 watcher
     */
    depend () {
        if (Dep.target) {
          Dep.target.addDep(this)
        }
    }

    removeSub(sub: Watcher) {
        // 删除subs数组中某一项 
        function remove (arr: Watcher[], item: Watcher) {
          if (arr.length) {
            const index = arr.indexOf(item)
            if (index > -1) {
              return arr.splice(index, 1)
            }
          }
        }
        remove(this.subs, sub)
    }

    /**
     * 通知观察者, 作出响应
     */
    notify () {
        this.subs.forEach((sub) => {
            sub.update()
        })
    }
}

const targetStack: Watcher[] = []; // 观察者数组

// 给Dep设置当前的观察者
export function pushTarget (target: Watcher) {
    targetStack.push(target)
    Dep.target = target
}

// 删除当前观察者
export function popTarget () {
    targetStack.pop()
    Dep.target = targetStack[targetStack.length - 1]
}