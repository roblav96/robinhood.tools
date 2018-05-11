// 

import Vue from 'vue'
import * as _ from '@/common/lodash'
import * as core from '@/common/core'



import SymbolLogo from '@/client/ui/symbol.logo/symbol.logo'
Vue.component('ui-symbol-logo', SymbolLogo)



export class Tabs {
	components = {} as Dict<any>
	constructor(
		public root: string,
		public tabs: Partial<Tab>[],
	) {
		tabs.forEach(v => {
			v.title = _.startCase(v.id)
			v.vcomponent = `v-${this.root}-${v.id}`
			this.components[v.vcomponent] = v.component
		})
		this.tabs = core.clone(tabs)
	}
	// clone() { return this.tabs.map(v => _.omit(v, 'component')) }
}

// export function buildTabs(tabs: Partial<Tab>[]) {
// 	return tabs.map(v => {
// 		v.name = v.title.toLowerCase()
// 		return v
// 	})
// }



declare global {
	interface Tab {
		id: string
		title: string
		icon: string
		vcomponent: string
		component: () => any
	}
}


