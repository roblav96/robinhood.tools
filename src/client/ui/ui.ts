// 

import * as util from 'util'

import * as Vts from 'vue-property-decorator'
import { mixins as Mixins } from 'vue-class-component'
import Vue from 'vue'
import * as _ from '@/common/lodash'
import * as core from '@/common/core'
import * as pretty from '@/common/pretty'



import SymbolLogo from '@/client/ui/symbol.logo/symbol.logo'
Vue.component('ui-symbol-logo', SymbolLogo)



Vue.directive('ui-green-red', function(el, { value, oldValue }) {
	if (value === oldValue) return;
	if (!core.number.isFinite(value)) return;
	if (value == 0) return el.classList.remove('has-text-danger', 'has-text-success');
	if (value > 0) {
		if (el.className.includes('has-text-success')) return;
		if (el.className.includes('has-text-danger')) {
			return el.classList.replace('has-text-danger', 'has-text-success')
		}
		return el.classList.add('has-text-success')
	}
	if (value < 0) {
		if (el.className.includes('has-text-danger')) return;
		if (el.className.includes('has-text-success')) {
			return el.classList.replace('has-text-success', 'has-text-danger')
		}
		return el.classList.add('has-text-danger')
	}
})



Vue.directive('busy', function(el, { value, oldValue }) {
	if (value === oldValue) return;
	el.style.visibility = value === true ? 'hidden' : ''
})



export class Tabs {
	components = {} as Dict<any>
	constructor(
		prefix: string,
		public tabs: Partial<Tab>[],
	) {
		tabs.forEach(v => {
			v.title = _.startCase(v.id)
			v.vcomponent = `v-${prefix}-${v.id}`
			this.components[v.vcomponent] = v.component
		})
		this.tabs = core.clone(tabs)
	}
}

declare global {
	interface Tab {
		id: string
		title: string
		icon: string
		vcomponent: string
		component: () => any
	}
}





// @Vts.Component({
// 	// template: `<span :class="color">{{value}}</span>`,
// 	template: `<span :class="color"><slot></slot></span>`,
// })
// class UIGreenRed extends Vue {
// 	// @Vts.Prop() value: number
// 	get color() {
// 		console.log('this.$el.textContent ->', this.$el.textContent)
// 		console.log('this.$el.innerText ->', this.$el.innerText)
// 		console.log('this.$el.outerText ->', this.$el.outerText)
// 		let value = Number.parseFloat(this.$el.innerText)
// 		if (value > 0) return 'has-text-success';
// 		if (value < 0) return 'has-text-danger';
// 	}
// }
// Vue.component('ui-green-red', UIGreenRed)

// Vue.directive('ui-green-red', {
// 	bind(el, binding, vnode) { },
// 	inserted(el, binding, vnode) { },
// 	update(el, binding, vnode) { },
// 	unbind(el, binding, vnode) { },
// })


