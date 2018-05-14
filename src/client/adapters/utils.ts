// 

import * as _ from '@/common/lodash'
import * as core from '@/common/core'



export function marketcapCategory(marketcap: number) {
	if (marketcap > (100 * 1000 * 1000 * 1000)) return 'mega';
	if (marketcap > (10 * 1000 * 1000 * 1000)) return 'large';
	if (marketcap > (2 * 1000 * 1000 * 1000)) return 'mid';
	if (marketcap > (300 * 1000 * 1000)) return 'small';
	if (marketcap > (50 * 1000 * 1000)) return 'micro';
	return 'nano'
}



export class Tabs {
	components = {} as Dict<any>
	constructor(
		prefix: string,
		public tabs: Partial<UI.Tab>[],
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
	namespace UI {
		interface Tab {
			id: string
			title: string
			icon: string
			vcomponent: string
			component: () => any
		}
	}
}


