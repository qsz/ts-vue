# 使用typescript从零开始实现vue

## 实现的功能
* typescript-simple-vue 简称 Tsue 
* 由于是为了梳理整个流程，所以暂不考虑 data是数组的情况，数组类型实现和对象类型原理一样，只是多些判断而已
* 实现的功能如下
    * 虚拟dom
    * 响应式、计算属性computed 和 侦听器watch
    * 组件化和生命周期
    * diff算法
* 在 [render函数中使用JSX语法](https://cn.vuejs.org/v2/guide/render-function.html#JSX) 代替模板编译

## 使用方式
```js
const tsue = new Tsue({
    el: '#app',
    data: function(){ 
        return {
            name: 'Tsue'
         }
    },
    
    render(h) {
      return ( 
        <div>
            <Welcome></Welcome>
            <div>{this.name}</div>
        </div>
      )
    }
})

function Welcome () {
    return {
        name: 'welcome',
        render(h) {
          return ( 
            <h1>Hello</h1>
          )
        }
    }
}    
```