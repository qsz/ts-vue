
import { CreateElement } from '../vdom/create-elemenet'
import VNode from '../vdom/vnode'
import Tsue from '../instance'

export interface TsVue {
    [propName: string]: any;

    _options: VmOptions & ComponentOptions<Tsue> | undefined;
    _el: string | undefined;
    _vnode: VNode | undefined;
    _data: Record<string, any>;
    _self: TsVue | undefined;
    _init(options:  VmOptions | ComponentOptions<Tsue>): void;
    _mount(el: string): void;
    _update(vnode: VNode): void;
    _render(h: CreateElement): VNode; 
    _initState(): void;
    _initData(data: any): void;
    _initMethods(methods: Record<string, Function>): void;
    _initComputed(computed: Record<string, Function>): void;
    _initWatch(watch: Record<string, Function>): void;
    _extend(options: VmOptions): VueComponentClassStatic;
    _nextTick(cb: Function): void;
    _set(target: Record<any, any>, key: any, val: any): any;
    _mergeOptions(options: VmOptions): VmOptions
}

/**
 * 定义子组件构造函数
 */
export interface VueComponentClassStatic {
    new (options: ComponentOptions<Tsue>): Tsue;
    super: Tsue
    options: VmOptions | null
}


// render函数，返回 vnode
export interface Render {
    (h: CreateElement): VNode
}

// 实例化Vue对象时的参数
export interface VmOptions {
    el?: string;
    data?: () => Record<string, any>;
    methods?: Record<string, Function>;
    watch?: Record<string, Function>;
    computed?: Record<string, Function>;
    render?: Render;
    name?: string;

    // 生命周期函数
    beforeCreate?: Function;
    created?: Function;
    beforeMount?: Function;
    mounted?: Function;
    beforeUpdate?: Function;
    updated?: Function;
    beforeDestroy?: Function;
    destroyed?: Function;
}

export type lifehook = 'beforeCreate' | 'created' | 'beforeMount' | 'mounted' 
| 'beforeUpdate' | 'updated' | 'beforeDestroy' | 'destroyed';

// 实例化组件时的参数
export interface ComponentOptions<V extends Tsue> {
    _isComponent?: boolean;           // 是否是组件
    parentVnode?: VNode;              // 父组件vnode
    parent?: V;                       // 父实例
}

export interface Attrs {
    [propName: string]: string
}

export interface OnFn {
    [propName: string]: Function
}

// 方便起见，只考虑部分: attrs, class, key, on, style
export interface VNodeData {
    attrs?: Attrs
    class?: string
    key?: string
    on?: OnFn
    style?: string,
    hook?: Record<string, any>
}
