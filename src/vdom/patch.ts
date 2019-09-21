import VNode from '../vdom/vnode'
import { isSameVnode, patchVnode } from './diff'

/**
 * 获取父节点
 * @param node 
 */
function getParentNode(node: Node): Node | null {
    return node.parentNode 
}

/**
 * 设置或更新节点属性 attr
 * @param vnode 
 */
export function updateAttrs(vnode: VNode, oldVnode?: VNode) {
    const { data, element } = vnode;
    const oldData  = oldVnode ? oldVnode.data: null;
    const attrs = data && data.attrs ? data && data.attrs: null;
    const oldAttrs = oldData && oldData.attrs ? oldData.attrs: null;

    if(oldAttrs) {
        // 遍历老的属性, 删除新css上不存在的属性
        for(let key in oldAttrs) { 
            if(!attrs || !attrs[key]) {
                // 如果新的没有该属性，则删除该属性
                if(element) {
                    (element as HTMLElement).setAttribute(key, ''); 
                }
                
            }
        }
    }
    if( attrs ) {
        // 遍历新属性
        for (let key in attrs) {
            const value = attrs[key];
            if( oldAttrs && oldAttrs[key] ) {
                // 如果老节点也有该属性，则对比，不一样就改变
                if ( oldAttrs[key] !== value ) {
                    element && (element as Element).setAttribute(key, value)
                }
            } else {
                // 老节点没有该属性，则新增
                element && (element as Element).setAttribute(key, value)
            }
        }
    }
}

/**
 * 设置或更新class
 * @param vnode 
 */
export function updateClass(vnode: VNode, oldVnode?: VNode) {
    const { data, element } = vnode;
    const oldData  = oldVnode ? oldVnode.data: null;
    const className = data && data.class ? data.class: null;
    const oldClassName = oldData && oldData.class ? oldData.class: null;
    if( className ) {
        // 新节点有className，则与老的对比是否相同
        if( oldClassName ) {
            if(oldClassName !== className) {
                element && (element as Element).setAttribute('class', className)
            }
        } else {
            element && (element as Element).setAttribute('class', className)
        }
    } else {
        // 新节点没有className则清空className
        element && (element as Element).removeAttribute('class')
    }
}

/**
 * 设置或更新style
 * @param vnode 
 */
export function updateStyle(vnode: VNode, oldVnode?: VNode) {
    const { data, element } = vnode;
    const oldData  = oldVnode ? oldVnode.data: null;
    const styleName = data && data.style ? data.style: null;
    const oldStyleName = oldData && oldData.style ? oldData.style: null;

    const _parseStyle: CSSStyleDeclaration | undefined = styleName ? parseStyleText(styleName): undefined
    const _oldParseStyle: CSSStyleDeclaration | undefined = oldStyleName ? parseStyleText(oldStyleName): undefined

    if(_oldParseStyle) {
        // 遍历老的css, 删除新css上不存在的样式
        for(let key in _oldParseStyle) { 
            if(!_parseStyle || !_parseStyle[key]) {
                // 如果新css没有该样式，则删除该样式
                if(element) {
                    (element as HTMLElement).style[key] = ''; 
                }
                
            }
        }
    }

    if(_parseStyle) {
        // 遍历新的css, 改变与老css不一样的属性的值
        for(let key in _parseStyle) { 
            const value = _parseStyle[key]
            if(!_oldParseStyle) {
                if(element) {
                    (element as HTMLElement).style[key] = value; 
                } 
            } else if(_oldParseStyle[key] !== value) {
                (element as HTMLElement).style[key] = value; 
            }
        }
    }
}

/**
 * 格式化css属性
 * @param cssText 
 */
const parseStyleText = function (cssText: string) {
    const res = Object.create(null);
    const listDelimiter = /;(?![^(]*\))/g;
    const propertyDelimiter = /:(.+)/;
    cssText.split(listDelimiter).forEach(function (item: string) {
      if (item) {
        const tmp = item.split(propertyDelimiter);
        tmp.length > 1 && (res[tmp[0].trim()] = tmp[1].trim());
      }
    });
    return res
};

/**
 * 绑定事件
 * @param vnode 
 */
export function updateListeners(vnode: VNode) {
    const { data, element } = vnode;
    if(data && data.on) {
        if(element) {
            for(let key in data.on) {
                element.addEventListener(key, () => {
                    data.on![key]()
                })
            }
        }
    }
}

/**
 * 渲染并挂载DOM
 * @param oldVnode
 * @param vnode 
 */
export default function patch(oldVnode: VNode | string | undefined, vnode: VNode) {
    if(!oldVnode) {
         // 没有oldVnode，说明是组件实例首次渲染
         createElm(vnode)
         // 组件DOM的vnode渲染完成后执行mounted钩子
         if(vnode.parent && vnode.parent.data && vnode.parent.data.hook) {
             vnode.parent.data.hook.mounted(vnode.parent)
         }
    } else {
        if(typeof oldVnode !== 'string' && oldVnode.element && isSameVnode(oldVnode, vnode)) {
            // 数据更新, 新旧节点相同
            patchVnode(oldVnode, vnode)
        } else {
            if(typeof oldVnode === 'string') {
                // 如果是dom节点，说明是Tsue初始化，首次渲染，转化为vnode
                const reallyDom = document.querySelector(oldVnode);
                if(reallyDom) {
                    oldVnode = new VNode(reallyDom.tagName, {}, [], undefined, reallyDom)
                } else {
                    return
                }
            } 
            if(oldVnode.element) {
                const parentNode = getParentNode(oldVnode.element)
                if(parentNode) {
                    createElm(vnode, parentNode)
                    // 替换老的节点
                    parentNode.removeChild(oldVnode.element)
                }
            }
        }
    }
    return vnode.element
}

/**
 * 创建节点并挂载
 * @param parentNode 
 * @param vnode 
 */
export function createElm(vnode: VNode, parentElem?: Node | undefined, refElm?: Node | undefined) {
    if (patchCreateComponent(vnode, parentElem)) {
        // 判断是否是组件，是则不进行后续操作
        return;
    }
    if(vnode.tag) {
        vnode.element = document.createElement(vnode.tag!);
        updateAttrs(vnode);
        updateClass(vnode);
        updateStyle(vnode);
        updateListeners(vnode);
        createChildren(vnode, vnode.children)
        if(parentElem) {
            if(refElm && refElm.parentNode === parentElem) {
                // 有refElm 就插入到refElm之前
                parentElem.insertBefore(vnode.element, refElm)
            } else {
                parentElem.appendChild(vnode.element)
            }
        }
    } else {
        // 没有tag就是文本节点
        vnode.text = vnode.text ? vnode.text: ''
        vnode.element = document.createTextNode(vnode.text)
        parentElem && parentElem.appendChild(vnode.element)
    }
}

/**
 * 判断是否是组件vnode，是则创建组件tsue实例
 * @param vnode 
 * @param parentElem 
 */
function patchCreateComponent(vnode: VNode, parentElem: Node | undefined): boolean {
    if(vnode.data) {
        if(vnode.data.hook) {
            const init = vnode.data.hook.init;
            if(init) {   
                // 有init钩子，说明是组件，则执行init钩子
                init(vnode)
            }
        }
        if(vnode.componentInstance && (typeof vnode.componentInstance._el !== 'string')) {
            vnode.element = vnode.componentInstance._el
            if(vnode.element) {
                parentElem && vnode && parentElem.appendChild(vnode.element)
            }
            return true  
        }
    }
    return false;
}
/**
 * 遍历子节点
 * @param vnode 
 */
function createChildren(vnode: VNode, children: VNode[] | undefined) {
    if(Array.isArray(children)) {
        children.forEach((v) => {
            createElm(v, vnode.element)
        })
    }
}

