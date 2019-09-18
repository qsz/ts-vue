import VNode from '../vdom/vnode'

/**
 * 获取父节点
 * @param node 
 */
function getParentNode(node: Node): Node | null {
    return node.parentNode 
}

/**
 * 设置节点属性 attr
 * @param vnode 
 */
function updateAttrs(vnode: VNode) {
    const { data, element } = vnode;
    if( data && data.attrs) {
        const attrs = data.attrs;
        for (let key in attrs) {
            const value = attrs[key];
            element && (element as Element).setAttribute(key, value)
        }
    }
}

/**
 * 设置class
 * @param vnode 
 */
function updateClass(vnode: VNode) {
    const { data, element } = vnode;
    if( data && data.class) {
        element && (element as Element).setAttribute('class', data.class)
    }
}

/**
 * 设置 style
 * @param vnode 
 */
function updateStyle(vnode: VNode) {
    const { data, element } = vnode;
    if(data && data.style) {
        const _parseStyle: CSSStyleDeclaration = parseStyleText(data.style)
        for(let key in _parseStyle) {
            (element as HTMLElement).style[key] = _parseStyle[key]; 
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
function updateListeners(vnode: VNode) {
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
    if(typeof oldVnode === 'string') {
        // 如果是dom节点，说明是初始化，首次渲染，转化为vnode
        const reallyDom = document.querySelector(oldVnode);
        if(reallyDom) {
            oldVnode = new VNode(reallyDom.tagName, {}, [], undefined, reallyDom)
            createElm(vnode, oldVnode.element)
        }
    } else {
        if(oldVnode && oldVnode.element) {
            // 数据更新
            const parentNode = getParentNode(oldVnode.element)
            if(parentNode) {
                parentNode.removeChild(oldVnode.element)
                createElm(vnode, parentNode)
            } else {
                createElm(vnode, undefined)
            }
        } else {
            // 组件实例首次渲染
            createElm(vnode)
            // 组件DOM的vnode渲染完成后执行mounted钩子
            if(vnode.parent && vnode.parent.data && vnode.parent.data.hook) {
                vnode.parent.data.hook.mounted(vnode.parent)
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
export function createElm(vnode: VNode, parentElem?: Node | undefined) {
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
        parentElem && parentElem.appendChild(vnode.element)
    } else {
        // 没有tag就是文本节点
        vnode.element = document.createTextNode(vnode.text || '')
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