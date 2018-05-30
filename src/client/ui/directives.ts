// 

import Vue, { DirectiveOptions } from 'vue'
import * as anime from 'animejs'
import * as core from '@/common/core'
import * as pretty from '@/common/pretty'
import * as utils from '@/client/adapters/utils'
import clock from '@/common/clock'



Vue.directive('visible', function(el, { value, oldValue }) {
	if (value === oldValue || !core.boolean.is(value)) return;
	el.classList.toggle('invisible', !value)
	// anime.remove(el)
	// if (value == true) {
	// 	let t = Date.now()
	// 	Vue.nextTick(() => {
	// 		let smooth = ((Date.now() - t) * 3)
	// 		anime({
	// 			targets: el,
	// 			easing: 'easeInQuad',
	// 			delay: smooth > 10 ? smooth : 0,
	// 			opacity: [
	// 				{ value: 0, duration: 0 },
	// 				{ value: 1, duration: 50 + smooth },
	// 			],
	// 		})
	// 	})
	// }
})



Vue.directive('is', function(el, { arg, modifiers }, { context }) {
	let classes = Object.keys(modifiers)
	let value = context.$store.state.breakpoints[arg] as boolean
	!value ? el.classList.remove(...classes) : el.classList.add(...classes)
})



Vue.directive('bull-bear', function(el, { value, oldValue, arg }) {
	if (value === oldValue || !core.number.isFinite(value)) return;
	arg = arg || 'has-text'
	if (value == 0) return el.classList.remove(arg + '-danger', arg + '-success');
	el.classList.toggle(arg + '-success', value > 0)
	el.classList.toggle(arg + '-danger', value < 0)
})

Vue.directive('bg-bull-bear', function(el, { value, oldValue, arg }) {
	if (value === oldValue || !core.number.isFinite(value)) return;
	if (value == 0) return el.classList.remove('bg-bullish', 'bg-bearish');
	el.classList.toggle('bg-bullish', value > 0)
	el.classList.toggle('bg-bearish', value < 0)
})



// Vue.directive('timestamp', {
// 	update(el, binding, vnode, oldVnode) {
// 		if (!binding.value) return binding.def.unbind(el, binding, vnode, oldVnode);
// 		el.innerHTML = utils.vfromnow(binding.value, binding.modifiers)
// 		clock.offContext('1s', el)
// 		clock.once('1s', () => binding.def.update(el, binding, vnode, oldVnode), el)
// 	},
// 	unbind(el, binding, vnode, oldVnode) {
// 		clock.offContext('1s', el)
// 		el.innerHTML = ''
// 	},
// 	// bind(el, binding, vnode, oldVnode) {
// 	// 	binding.value = Date.now()
// 	// 	binding.def.update(el, binding, vnode, oldVnode)
// 	// },
// 	// inserted(el, binding, vnode, oldVnode) {
// 	// 	binding.value = Date.now()
// 	// 	binding.def.update(el, binding, vnode, oldVnode)
// 	// },
// 	// componentUpdated(el, binding, vnode, oldVnode) {
// 	// 	binding.value = Date.now()
// 	// 	binding.def.update(el, binding, vnode, oldVnode)
// 	// },
// })



// Vue.directive('number-ticker', function(el, { oldValue, value }: { oldValue: number, value: number }) {
// 	if (value == oldValue) return;
// 	if (!Number.isFinite(value)) return;
// 	let direction = value > oldValue ? 'up' : 'down' as 'up' | 'down'
// 	let voldValue = Number.isFinite(oldValue) ? utils.vnumber(oldValue) : ''
// 	let olddigits = voldValue.split('')
// 	console.log('olddigits ->', olddigits)
// 	let vvalue = utils.vnumber(value)
// 	let digits = vvalue.split('')
// 	console.log('digits ->', digits)
// 	digits.forEach((digit, i) => {
// 		let old = olddigits[i]
// 		if (digit == old) return;
// 		let child = el.children.item(i)
// 		let span = document.createElement('span')
// 		span.innerText = digit
// 		if (!child) return el.appendChild(span);
// 		el.removeChild(child)
// 		el.appendChild(span)
// 	})
// })





declare module 'vue/types/vnode' {
	export interface VNodeDirective {
		readonly rawName: string
		readonly def: DirectiveOptions
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


