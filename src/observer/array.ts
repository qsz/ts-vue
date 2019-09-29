import { ObserveValue } from '../observer'

type arrMethod = 'push' | 'pop' | 'shift' | 'unshift' | 'splice' | 'sort' | 'reverse' 

const arrayProto = Array.prototype
const ArrayMethods: Record<string, Function> = Object.create(arrayProto)


// 以下这些方法都会改变数组，所以对其进行改写
// 每次调用下面的方法，都将触发更新
const methodsToPatch: arrMethod[] = [
    'push',
    'pop',
    'shift',
    'unshift',
    'splice',
    'sort',
    'reverse'
]
methodsToPatch.forEach(function(method) {
    ArrayMethods[method] = function (this: ObserveValue, ...args:any) { 
      let result;
      const ob = this.__ob__
      let inserted
      switch (method) {
        case 'push':
        case 'unshift':
          result =  arrayProto[method].apply(this, args);
          inserted = args
          break
        case 'splice':
          result =  arrayProto[method].apply(this, args);
          inserted = args.slice(2)
          break;
        default:
          result =  arrayProto[method].apply(this, args);
          break;
      }
      if(ob) {
        // 把新增的数据变为响应式
        if (inserted) ob.observeArray(inserted)
        
        // 通知数据更新
        ob.dep.notify()
      }
      
      return result
    }
})

export default ArrayMethods