// 

import * as _ from '@/common/lodash'
import * as core from '@/common/core'



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


