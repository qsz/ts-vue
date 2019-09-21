import VNode from '../vdom/vnode'
import { createElm, updateAttrs, updateClass, updateStyle } from './patch'

/**
 * 新旧节点相同，diff更新DOM
 * @param oldVnode 
 * @param newVnode 
 */
export function patchVnode( oldVnode: VNode, newVnode: VNode) {
    const element = newVnode.element = oldVnode.element
    const oldChildren = oldVnode.children;
    const children = newVnode.children;

    // 对data做更新
    if(newVnode.data) {
        const cbs = [ updateAttrs, updateClass, updateStyle ]
        cbs.forEach((cb: Function) => {
            cb(newVnode, oldVnode)
        })
    }

    if(element) {
        if(!newVnode.text) { 
            // 如果新节点不是文本节点
            if(oldChildren && children) {
                // 子vnode都存在
                updateChildren(element, oldChildren, children)
            } else if(children) {
                // 老的节点不存在子节点，新增新的子节点
                addVnodes(element, undefined, children, 0, children.length - 1)
            } else if(oldChildren) {
                // 新的节点不存在子节点, 删除老的子节点
                removeVnodes(oldChildren, 0, oldChildren.length - 1)
            }
        } else {
            if(oldVnode.text !== newVnode.text) {
                // 如果文本内容不同
                element.textContent = newVnode.text
            }
        }
    } 

    
}

/**
 * diff更新子节点
 * @param parentElm 父节点
 * @param oldCh     老的子节点数组, 已经挂载到DOM上
 * @param newCh     新的子节点数组, 还未挂载到DOM上
 */
export function updateChildren(parentElm: Node, oldCh: VNode[], newCh: VNode[]) {

    let oldStartIdx = 0;
    let oldEndIdx = oldCh.length - 1;
    let oldStartVnode = oldCh[0];     

    let newStartIdx = 0;
    let newEndIdx = newCh.length - 1;
    let newStartVnode = newCh[0];

    let oldKeyToIdx; // 缓存节点和key的对应关系
  
    while(oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
        if(!oldStartVnode || oldStartVnode.isNull) {              // 情况1
            // 老节点为空，则对比下一个老节点。会产生这种情况是因为经过了情况3
            oldStartVnode = oldCh[++oldStartIdx]
        } else if(isSameVnode(oldStartVnode, newStartVnode)) {    // 情况2
            // 相同节点, 对比子节点
            patchVnode(oldStartVnode, newStartVnode)
            oldStartVnode = oldCh[++oldStartIdx];
            newStartVnode = newCh[++newStartIdx];
        } 

        // else if(isSameVnode(oldStartVnode, newEndVnode)){
        //     // 老的第一个节点和新的最后一个节点相同

        //     patchVnode(oldStartVnode, newEndVnode)
        //     if( oldStartVnode.element ) {
        //         parentElm.insertBefore(oldStartVnode.element, oldEndVnode.element ? oldEndVnode.element.nextSibling : null)
        //     }
        //     oldStartVnode = oldCh[++oldStartIdx];
        //     newEndVnode = newCh[--newEndIdx];
        // } 

        else {                                                    // 情况3
            // 不遍历老节点，而是遍历新节点，与老节点key的对应关系对比
            if(!oldKeyToIdx) {
                oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx)
            } 
            let idxInOld;
            if(newStartVnode.key) { // 如果新节点有key值
                idxInOld = oldKeyToIdx[newStartVnode.key]
            } else {                
                idxInOld = findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx)
            }
            if(idxInOld !== undefined) {     
                 // 如果老节点中存在和新节点相同的节点
                 const vnodeToMove = oldCh[idxInOld];              // 需要移动的节点
                 if(vnodeToMove && vnodeToMove.element) {
                    if (isSameVnode(vnodeToMove, newStartVnode)) { // 判断节点类型是否相同
                        // key相同，节点类型也相同
                        patchVnode(vnodeToMove, newStartVnode)
                        // 将相同的老节点重置为空
                        oldCh[idxInOld] = new VNode(undefined, undefined, undefined, undefined, undefined, undefined, undefined, true);
                        parentElm.insertBefore(vnodeToMove.element, oldStartVnode.element || null)
                     } else {
                         // key相同，但节点类型不同，则创建新节点
                        createElm(newStartVnode, parentElm, oldStartVnode.element)
                     }  
                 }   
            } else {
                // 没有相同的节点，则新建节点
                createElm(newStartVnode, parentElm, oldStartVnode.element)
            }
            newStartVnode = newCh[++newStartIdx];
        }
    }
    if(oldStartIdx > oldEndIdx) { 
        // 说明是情况2, 老节点遍历完了，新节点可能还没遍历完
        // 将剩余的节点插入
        addVnodes(parentElm, undefined, newCh, newStartIdx, newEndIdx)

    } else if(newStartIdx > newEndIdx){
        // 情况3，所有的新节点都遍历完了
        // 删除多余的老节点
        removeVnodes(oldCh, oldStartIdx, oldEndIdx)
    }
}

/**
 * 判断是否是同一节点, key是否相同，节点类型是否相同，是否都有data值
 * @param oldVnode 
 * @param newVnode 
 */
export function isSameVnode(oldVnode: VNode, newVnode: VNode) {
    return oldVnode.key === newVnode.key && (
        (oldVnode.tag === newVnode.tag) && ((oldVnode.data && newVnode.data) || (!oldVnode.data && !newVnode.data))
    )
}


/**
 * 旧的子节点中，生成节点和key的对应关系
 * @param children 
 * @param beginIdx 
 * @param endIdx 
 */
export function createKeyToOldIdx(children:VNode[], beginIdx: number, endIdx:number): Record<any, number> {
    let i = 0
    let key: any;
    let map: Record<any, number> = {};
    for (i = beginIdx; i <= endIdx; i++) {
      key = children[i].key;
      if(key) {
        map[key] = i; 
      }
    }
    return map
}

/**
 * 遍历寻找新老节点中是否有相同的节点
 * @param node 
 * @param oldCh 
 * @param start 
 * @param end 
 */
export function findIdxInOld (node: VNode, oldCh: VNode[], start: number, end: number) {
    for (let i = start; i < end; i++) {
       let c = oldCh[i];
       if (c && isSameVnode(node, c)) { 
          return i 
       }
    }
}

/**
 * 遍历vnode数组，新增节点
 */
export function addVnodes(parentElm: Node, refElm: Node | undefined, vnodes: VNode[], startIdx: number, endIdx: number): void{
    while(startIdx <= endIdx) {
        createElm(vnodes[startIdx], parentElm, undefined)
        ++startIdx
    }
}

/**
 * 遍历vnode数组，删除节点
 */
export function removeVnodes(vnodes: VNode[], startIdx: number, endIdx: number): void {
    while(startIdx <= endIdx) {
        let vnode = vnodes[startIdx];
        if(vnode && !vnode.isNull) {      // 因为在老节点中，只要是相同的节点，都已经做过处理，vnode.isNull===true
            if(vnode.tag) {
                if(vnode.element) {
                    removeNode(vnode.element)
                }   
                invokeDestroyHook(vnode)  // 执行distory钩子函数
            } else {                      // 文本节点直接删除 
                if(vnode.element) {
                    removeNode(vnode.element)
                }   
            }
        }
        ++startIdx
    }
}

/**
 * 删除节点
 * @param element 
 */
function removeNode(element: Node): void {
    const parentNode = element.parentNode;
    if(parentNode) {
        parentNode.removeChild(element)
    }
}

/**
 * 执行distory钩子函数，执行beforeDestroy、destroyed生命周期
 * @param vnode 
 */
function invokeDestroyHook(vnode: VNode): void {
    if(vnode.data && vnode.data.hook && vnode.data.hook.destroy) {
        vnode.data.hook.destroy(vnode)
    }
    // 遍历子节点, 执行子节点的distory钩子函数
    if (vnode.children) {
        for (let j = 0; j < vnode.children.length; ++j) {
          invokeDestroyHook(vnode.children[j]);
        }
    }
}


