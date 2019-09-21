import { VmOptions, VNodeData, ComponentOptions } from '../types'
import VNode from './vnode'
import Tsue from '../instance'
import callHook from '../instance/lifecycle'

/**
 * 创建组件vnode
 * @param Ctor  options参数
 * @param data  
 * @param context Tsue实例
 */
export default function createComponent(Ctor: VmOptions, data: VNodeData | undefined, context: Tsue): VNode {
    // _Ctor为Tsue子类构造函数
    const _Ctor = context._extend(Ctor)
    if(!data) {
        data = {}
    }
    installComponentHooks(data, context)
    // 创建组件vnode
    const vnode = new VNode(
        Ctor.name || 'tsue-component',
        data,
        undefined,
        undefined,
        undefined,
        context,
        {              // componentOptions
            Ctor: _Ctor
        }
    )
    return vnode
}

/**
 * 创建组件钩子函数
 * @param data 
 * @param parent 
 */
function installComponentHooks(data: VNodeData, parent: Tsue) {
    const hook = Object.create({})
    hook.init = function(vnode: VNode) { // 创建组件时候执行, 这里的vnode是组件vnode
        if(vnode.componentOptions) {
            const child = createComponentInstance(vnode, parent)  // 创建组件tsue实例
            vnode.componentInstance  = child
            child && child._mount(undefined)
        }
    }
    hook.mounted = function(vnode: VNode) { // 组件插入完成后执行
        const componentInstance = vnode.componentInstance;
        if (componentInstance && !componentInstance._isMounted && !componentInstance._isDestroyed) { // 挂载完成
          componentInstance._isMounted = true;
          // mounted生命周期
          callHook(componentInstance, 'mounted');
        }
    }
    hook.destroy = function(vnode: VNode) {           // 组件销毁时执行
        const componentInstance = vnode.componentInstance;
        if (componentInstance && !componentInstance._isDestroyed) {
            componentInstance._destroy();
        }
    }
    data.hook = hook
}

/**
 * 创建子组件实例
 * @param vnode 
 * @param parent 
 */
function createComponentInstance(vnode: VNode, parent: Tsue) {
    const options = {
        _isComponent: true,          // 是否是组件
        parentVnode: vnode,          // 组件vnode
        parent                       // Tsue实例
    }
    if(vnode.componentOptions) {
        return new vnode.componentOptions.Ctor(options)  // 创建组件实例
    }
}