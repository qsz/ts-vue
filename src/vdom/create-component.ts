import { VmOptions, VNodeData, ComponentOptions } from '../types'
import VNode from './vnode'
import Tsue from '../instance'
/**
 * 创建组件
 */
export default function createComponent(Ctor: VmOptions, data: VNodeData | undefined, context: Tsue) {
    // TODO
    const _Ctor = context._extend(Ctor)
    if(!data) {
        data = {}
    }
    installComponentHooks(data, context)
    const vnode = new VNode(
        Ctor.name || 'tsue-component',
        data,
        undefined,
        undefined,
        undefined,
        context,
        {
            Ctor: _Ctor
        }
    )
    return vnode
}

function installComponentHooks(data: VNodeData, parent: Tsue) {
    const hook = Object.create({})
    hook.init = function(vnode: VNode) {
        const options = {
            _isComponent: true,
            _parentVnode: vnode,
            parent
        }
        if(vnode.componentOptions) {
            const child = new vnode.componentOptions.Ctor(options)  // 创建子组件实例
            vnode.componentInstance  = child
            child._mount(undefined)
        }
    }
    data.hook = hook
    // TODO
}