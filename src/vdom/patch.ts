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
 * 
 * @param oldVnode vnode or dom节点
 * @param vnode 
 */
export default function patch(oldVnode: VNode | string, vnode: VNode) {
    if(typeof oldVnode === 'string') {
        // 如果是dom节点，说明是初始化，首次渲染，转化为vnode
        const reallyDom = document.querySelector(oldVnode);
        oldVnode = new VNode(reallyDom!.tagName, {}, [], undefined, reallyDom!)
        createElm(oldVnode.element!, vnode)
    } else {
        const parentNode = getParentNode(oldVnode.element!)
        if(parentNode) {
            (parentNode as Element).innerHTML = ''
            createElm(parentNode, vnode)
        } else {
            createElm(undefined, vnode)
        }
    }
}

/**
 * 创建节点并挂载
 * @param parentNode 
 * @param vnode 
 */
export function createElm(parentElem: Node | undefined, vnode: VNode) {
    console.log(parentElem, vnode)
    // 创建子组件
    if (createComponent(vnode, parentElem)) {
        return
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

function createComponent(vnode: VNode, parentElem: Node | undefined): boolean {
    if(vnode.data && vnode.data.hook) {
        const init = vnode.data.hook.init;
        if(init) {
            init(vnode)
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
            createElm(vnode.element!, v)
        })
    }
}