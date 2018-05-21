// 

import Vue, { DirectiveOptions } from 'vue'
import * as core from '@/common/core'
import * as utils from '@/client/adapters/utils'



Vue.directive('visible', function(el, { value }) {
	if (!core.boolean.is(value)) return;
	el.classList.toggle('opacity-0', !value)
})



Vue.directive('is', function(el, { arg, modifiers }, { context }) {
	let classes = Object.keys(modifiers)
	let value = context.$store.state.breakpoints[arg]
	value ? el.classList.add(...classes) : el.classList.remove(...classes)
})



Vue.directive('bull-bear', function(el, { value, arg }) {
	if (!core.number.isFinite(value)) return;
	arg = arg || 'has-text'
	if (value == 0) return el.classList.remove(arg + '-danger', arg + '-success');
	el.classList.toggle(arg + '-success', value > 0)
	el.classList.toggle(arg + '-danger', value < 0)
})

Vue.directive('bg-bull-bear', function(el, { value, arg }) {
	if (!core.number.isFinite(value)) return;
	if (value == 0) return el.classList.remove('bg-bullish', 'bg-bearish');
	el.classList.toggle('bg-bullish', value > 0)
	el.classList.toggle('bg-bearish', value < 0)
})





declare module 'vue/types/vnode' {
	export interface VNodeDirective {
		rawName: string
		def: DirectiveOptions
		// def: VNodeDirectiveDef
	}
	interface VNodeDirectiveDef extends DirectiveOptions { [key: string]: any }
}





// Vue.directive('ui-bull-bear', {
// 	bind(el, binding, vnode) { },
// 	inserted(el, binding, vnode) { },
// 	update(el, binding, vnode) { },
// 	unbind(el, binding, vnode) { },
// })

// Vue.directive('is', function(el, binding, { context }) {
// 	console.log('binding ->', binding)
// 	// console.log('breakpoints ->', JSON.parse(JSON.stringify(context.$store.state.breakpoints)))
// })


