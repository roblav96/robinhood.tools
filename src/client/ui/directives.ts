// 

import Vue from 'vue'
import * as core from '@/common/core'



Vue.directive('visible', function(el, { value }) {
	el.classList.toggle('invisible', !value)
})



Vue.directive('is', function(el, { arg, modifiers }, { context }) {
	let classes = Object.keys(modifiers)
	if (context.$store.state.breakpoint[arg]) {
		el.classList.add(...classes)
	} else el.classList.remove(...classes)
})



Vue.directive('ui-green-red', function(el, { value }) {
	if (!core.number.isFinite(value)) return;
	if (value == 0) return el.classList.remove('has-text-danger', 'has-text-success');
	el.classList.toggle('has-text-success', value > 0)
	el.classList.toggle('has-text-danger', value < 0)
})





// Vue.directive('ui-green-red', {
// 	bind(el, binding, vnode) { },
// 	inserted(el, binding, vnode) { },
// 	update(el, binding, vnode) { },
// 	unbind(el, binding, vnode) { },
// })

// Vue.directive('is', function(el, binding, { context }) {
// 	console.log('binding ->', binding)
// 	// console.log('breakpoint ->', JSON.parse(JSON.stringify(context.$store.state.breakpoint)))
// })


