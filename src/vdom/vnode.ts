import { VNodeData, VueComponentClassStatic } from '../types'
import Tsue from '../instance'

interface VNodeComponentOptions {
    Ctor: VueComponentClassStatic;
}
/**
 * 虚拟dom构造函数
 */
export default class VNode {
    isNull?: boolean = false;                       
    tag?: string | undefined;
    data?: VNodeData | undefined;
    children?: VNode[] | [];
    text?: string | undefined;
    element?: Node | undefined;
    context?: Tsue | undefined;
    key?: string;
    parent?: VNode | undefined;                      // 父vnode, 组件下的vnode才有parent
    componentOptions?: VNodeComponentOptions | void; // 组件option
    componentInstance?: Tsue;                        // 组件tsue实例

    constructor(
        tag?: string,                                    // 标签
        data?: VNodeData,                                // 节点数据，包括节点属性等
        children?: VNode[],                              // 子节点
        text?: string,                                   // 文本
        element?: Node,                                  // 挂载的dom
        context?: Tsue,                                  // vnode的实例对象，组件或vue实例, 若为undefined则为顶点vnode
        componentOptions?: VNodeComponentOptions,        // 组件的设置
        isNull?: boolean                                 // 是否是空节点
    ) {
        this.tag = tag;
        this.data = data;
        this.children = children;
        this.text = text ? String(text): undefined;
        this.element = element;
        this.context = context;
        this.key = data && data.key;
        this.componentOptions = componentOptions;
        this.isNull = isNull;
    }
}