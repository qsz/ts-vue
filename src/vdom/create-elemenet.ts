import { VNodeData } from '../types'
import { isObject } from '../utils'
import VNode from './vnode'
import Tsue from '../instance'
import createComponent from './create-component'

export interface CreateElement {
    (tag?: string, attr?: VNodeData, ...children: any[]): VNode
}

/**
 * 创建文本节点
 * @param text 
 */
function createTextVNode(text: any): VNode {
    return new VNode(undefined, undefined, undefined, String(text))
}

/**
 * 区分文本节点和普通节点
 * @param children 
 */
function normalizeArrayChildren(children: any[]): any[] {
    let res: any[] = []
    children.forEach((node) => {
        if(typeof node  === 'string' || typeof node  === 'number') {
            res.push(createTextVNode(node))
        } else if(Array.isArray(node)){
            res = res.concat(normalizeArrayChildren(node))
        } else {
            res.push(node)
        }
    })
    return res;
}

/**
 * 返回vnode
 * @param context 
 * @param tag 
 * @param data 
 * @param children 
 */
const  createElement = function(context: Tsue, tag?: string | Function | any, data?: VNodeData, children?: any[]): VNode {
    if(Array.isArray(data)) {  // 如果是数组，将data设为children
        children = data
        data = undefined
    } 
    let vnode;
    if(children) {
        children = normalizeArrayChildren(children)
    }
    if(tag) {
        if (typeof tag === 'string') { // 普通节点
            vnode = new VNode(tag, data, children, undefined, undefined, context);
        } else if(isObject(tag)){      // 子节点, 对象类型
            vnode = createComponent(tag, data, context)
        } else {
            vnode = tag()
        }
    }
  
    return vnode;
}

export default createElement