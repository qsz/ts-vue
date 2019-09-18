import { VmOptions, ComponentOptions, VueComponentClassStatic } from '../types'
import VNode from '../vdom/vnode'
import createElement from '../vdom/create-elemenet'
import patch from '../vdom/patch'
import { proxy, observe, defineReactive, Observer } from '../observer'
import Watcher from '../observer/watcher'
import Dep from '../observer/dep'
import { noop, nextTick } from '../utils'
import callHook from './lifecycle'

let vid = 0
   
/**
 * 实现构造函数，实例化有两种场景
 * 1.组件初始化
 * 2.实例化Vue对象
 */
export default class Tsue{
    [propName: string]: any;
    _vid: number
    _options: VmOptions & ComponentOptions<Tsue> = {};
    _self: Tsue | undefined;
    _el: string | Node | undefined;
    _vnode: VNode | undefined;        // 实例vnode
    $parentVnode: VNode | undefined;  // 父vnode
    _data: any;
    _isMounted: boolean = false;      // 是否已经挂载到真实DOM上  

    constructor(options: VmOptions & ComponentOptions<Tsue>) {
        this._vid = vid++
        this._init(options)
    }
    /**
     * 初始化方法
     */
    _init(options: VmOptions & ComponentOptions<Tsue>){
        if(options && options._isComponent) { 
            // 如果是组件
            this._options = Object.create(this.constructor.options); // 组件传入的options
            this._options.parent = options.parent;
            this._options.parentVnode = options.parentVnode;
        } else {        
            this._options = this._mergeOptions(options);
        }
        this._self = this;
        callHook(this, 'beforeCreate')
        this._initState()
        callHook(this, 'created')
        if(this._options.el && document.querySelector(this._options.el)) {  
            this._el = this._options.el;
            this._mount(this._options.el);
        }
    }
    // 挂载到真实dom上
    _mount(el: string | undefined){
        callHook(this, 'beforeMount')
        const updateComponent = () => {
            this._update(this._render())
        }
        const vm = this
        // Watcher实例化的时候就会执行 updateComponent
        const wacther = new Watcher(this, updateComponent, noop, {
            before() {
                if (vm._isMounted) {
                    // beforeUpdate 生命周期
                    callHook(vm, 'beforeUpdate')
                }
            }
        }); 
        if(!this.$parentVnode) {
            // 没有$parentVnode 说明是 Tsue实例化
            this._isMounted = true;
            callHook(this, 'mounted')
        }
    }
    // 把 VNode 渲染成真实的 DOM, 在 首次渲染、组件渲染 或 数据更新 会调用
    _update(vnode: VNode){ 
        const prevVnode = this._vnode;
        this._vnode = vnode;
        if(prevVnode) {  
            // 数据更新  
            this._el = patch(prevVnode, vnode)
        } else {   
            if(!this._el) {
                // 组件渲染
                this._el = patch(undefined, vnode) 
            } else if(typeof this._el === 'string') {
                // 首次渲染
                this._el = patch(this._el, vnode) 
            }   
        }
    }
    // 生成vnode
    _render(): VNode{
        const render = this._options.render;
        const parentVnode = this._options.parentVnode
        this.$parentVnode = parentVnode;
        if(!render) {
            return {}
        } 
        const h = (tag: any, attr: any, children: any[]): VNode => {
            return createElement(this, tag, attr, children)
        };
        // vnode实例
        const vnode: VNode = render.call(this, h);
        // 组件vnode才会存在parent
        vnode.parent = parentVnode;

        return vnode
    }
    // 初始化methods、data、computed、watch数据
    _initState() {
        if(this._options && this._options.methods) {
            this._initMethods(this._options.methods)
        }
        if(this._options && this._options.data) {
            this._initData(this._options.data)
        }
        if (this._options && this._options.computed ) {
            this._initComputed(this._options.computed)
        }
        if (this._options && this._options.watch ) {
            this._initWatch(this._options.watch)
        }
    }

    // 合并data，将data的每个值代理到实例上，并把data变成响应式
    _initData(data: any) {
        data = this._data = typeof data === 'function'? data.call(this, this): data
        // 将data的每个值代理到实例上， 这样就能通过 this.key 访问到 data 上的某个值
        Object.keys(data).forEach((key) => {
            proxy(this, '_data', key)
        })  
        // 把data变成响应式
        observe(data)
    }

    // 合并 methods
    _initMethods(methods: Record<string, Function>) {
        for(let key in methods) {
            this[key] = methods[key].bind(this)
        }
    }

    // 初始化计算属性
    _initComputed(computed: Record<string, Function>) {
        const watchers: Record<string, Watcher> = Object.create(null) // 创建空对象 {}
        const sharedPropertyDefinition = {
            enumerable: true,
            configurable: true,
            get: noop,
            set: noop
        }
          
        function createComputedGetter (key: string) {
            return function computedGetter () {
              const watcher = watchers[key]
              if (watcher) {
                if (watcher.dirty) {
                    watcher.evaluate() // 即执行 watcher.get()，即计算属性用户设置的getter
                }
                if (Dep.target) {
                    watcher.depend()
                }
                return watcher.value  // value = watcher.get()
              }
            }
        }
       
        for(let key in computed) {
           const fuc = computed[key]
           watchers[key] = new Watcher(
            this,
            fuc,
            noop,
            { lazy: true }
          )

          if(key in this) {
            throw Error(`The computed property ${key} is already defined in data`)
          } else {
            sharedPropertyDefinition.get = createComputedGetter(key)
            sharedPropertyDefinition.set = noop
            Object.defineProperty(this, key, sharedPropertyDefinition)
          }
        }
    }

    // 初始化侦听器watch
    _initWatch(watch: Record<string, Function>) {
        function _createWatcher(vm: Tsue, key: string, func: Function) {
            const expOrFn = key
            const watcher = new Watcher(vm, expOrFn, func, {
                user: true
            })
        }
        for(const key in watch) {
            const func = watch[key]
            _createWatcher(this, key, func)
        }
    }

    /**
     * 创建子类
     * @params extendOptions 组件传入的options
     */
    _extend(extendOptions: VmOptions): VueComponentClassStatic {
        const Super = this
        class TsueComponent extends Tsue {
            static super: Tsue = Super
            static options = extendOptions
            constructor(options: ComponentOptions<Tsue>) {
                super(options)
            }
        }
        return TsueComponent
    }

    // 合并options
    _mergeOptions(options: VmOptions): VmOptions {
        // TODO
        return options
    }

    // 异步执行
    _nextTick(cb: Function){
        nextTick(cb)
    }

    _set(target: Record<any, any>, key: any, val: any): any {
        if(key in target) {
            target[key] = val;
            return val;
        }
        const __ob__: Observer = target.__ob__;  // __ob__即Observer实例
        if(!__ob__) {                       
            // 如果target上没有__ob__值，说明target不是响应式对象
            target[key] = val;
            return val
        }
        defineReactive(target, key, val)
        __ob__.dep.notify()
    }
}




