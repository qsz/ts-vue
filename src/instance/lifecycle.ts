import Tsue from '../instance'
import { lifehook } from '../types'

/**
 * 执行生命周期函数
 * @param vm 
 * @param hook 
 */
export default function callHook(vm: Tsue, hook: lifehook) {
    const hander = vm._options[hook]
    if(hander) {
        hander.call(vm)
    }
}