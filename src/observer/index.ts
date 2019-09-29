import Tsue from '../instance'
import Dep from './dep'
import { def, isObject } from '../utils'
import arrayMethods from './array'

/**
 * 用于生成observer实例, observer会把value变成响应式，返回 Observer 实例
 * @param value 
 */
export function observe(value: any): Observer | void{
    if(!isObject(value)) { // 只有对象类型才需要变为响应式
        return;
    }
    let ob: Observer
    if(value.__ob__){       // 如果value上已经存在, __ob__: observer实例， 说明value已经是响应式对象
        ob = value.__ob__
    }
    ob = new Observer(value)
    return ob;
}

export interface ObserveValue {
    __ob__ ?: Observer
}

/**
 * 遍历value调用defineReactive，把value变成响应式
 */
export class Observer {
    value: any;
    dep: Dep;

    constructor(value: ObserveValue) {
        this.dep = new Dep()        // 订阅收集器
        def(value, '__ob__', this); // 给 value 增加一个 __ob__ 值，指向 Observer 实例，表示value是响应式对象
        if(Array.isArray(value)) {  // 判断value是否是数组
            Object.setPrototypeOf(value, arrayMethods);  // value.__proto__ = arrayMethods
            this.observeArray(value)
        } else {
            this.walk(value)
        }
        
    }

    // 遍历obj的属性， 将每个属性变成响应式
    walk(obj: any) {
        Object.keys(obj).forEach((key) => {
            defineReactive(obj, key)
        })
    }

    // 遍历数组，把数组中的每个子项变成响应式。注意：并不是把数组变成响应式
    observeArray(arr: Array<any>) {
        for (let i = 0; i < arr.length; i++) {
            observe(arr[i])
        }
    }
} 

/**
 * 定义一个响应式对象，给对象添加 getter 和 setter
 * @param obj 
 * @param key 
 * @param val 
 */
export function defineReactive(obj: Record<any, any>, key: string, val?: any) {
    const dep = new Dep()

    const property = Object.getOwnPropertyDescriptor(obj, key)
    if (property && property.configurable === false) {    // 属性不可更改就直接返回
        return
    }
    const getter = property && property.get
    const setter = property && property.set
    if ((!getter || setter) && arguments.length === 2) {
        val = obj[key]
    }
    let childOb = observe(val) // 对子对象递归调用observe，使子对象也变为响应式。childOb为Observer实例
    Object.defineProperty(obj, key, {
        enumerable: true,
        configurable: true,
        get: function() {
            const value = getter ? getter.call(obj) : val;
            if (Dep.target) {
                dep.depend()
                if (childOb) {
                  childOb.dep.depend()
                }
            }
            return value
        },
        set: function(newVal) {
            const value = getter ? getter.call(obj) : val
            if (newVal === value || (newVal !== newVal && value !== value)) {
                return
            }
            val = newVal              // 将val变为新值。必包
            childOb = observe(newVal) // 如果 newVal 是 object类型，则将其也变为响应式对象
            dep.notify()              // 数据更新，通知watcher
        }
    })     
}

/**
 * 代理属性
 * @param vm 
 * @param source 
 * @param key 
 */
export function proxy(vm:Tsue, source: string, key: string) {
    const sharedPropertyDefinition = Object.create(null)
    sharedPropertyDefinition.enumerable = true;
    sharedPropertyDefinition.configurable = true;
    sharedPropertyDefinition.get = function proxyGetter () {
        return vm[source][key]
    }
    sharedPropertyDefinition.set = function proxySetter (val: any) {
        vm[source][key] = val
    }
    Object.defineProperty(vm, key, sharedPropertyDefinition)
}