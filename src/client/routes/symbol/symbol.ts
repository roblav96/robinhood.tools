// 

import * as Vts from 'vue-property-decorator'
import { mixins as Mixins } from 'vue-class-component'
import Vue from 'vue'
import lockr from 'lockr'
import VMixin from '@/client/mixins/v.mixin'
import * as _ from '@/common/lodash'
import * as core from '@/common/core'
import * as rkeys from '@/common/rkeys'
import * as http from '@/client/adapters/http'
import * as ui from '@/client/ui/ui'
import socket from '@/client/adapters/socket'



const TABS = new ui.Tabs('symbol', [{
	id: 'summary',
	icon: 'cash-100',
	component: () => import('@/client/routes/symbol/symbol.summary'),
}, {
	id: 'chart',
	icon: 'chart-line',
	component: () => import('@/client/routes/symbol/symbol.chart'),
}, {
	id: 'news',
	icon: 'newspaper',
	component: () => import('@/client/routes/symbol/symbol.news'),
}])

@Vts.Component({
	components: TABS.components,
	// beforeRouteEnter(to, from, next) {
	// 	if (!to.params.symbol) return next(false);
	// 	if (to.query.tab && TABS.tabs.find(v => v.id == to.query.tab)) return next();
	// 	let route = core.clone(to)
	// 	let i = lockr.get('symbol.tab.tabindex', 0)
	// 	route.query.tab = TABS.tabs[i].id
	// 	next(route)
	// },
})
export default class extends Mixins(VMixin) {

	get symbol() { return this.$route.params.symbol }

	tabs = TABS.tabs
	tabindex = 0

	created() {
		// Object.keys(this.$options.components).forEach(key => {
		// 	let starts = 'v-symbol-tab-'
		// 	if (!key.startsWith(starts)) return;
		// 	let id = key.substr(starts.length)
		// 	this.tabs.push({ id, title: _.startCase(id), component: key })
		// })
		// console.log('this.tabs ->', this.tabs)
	}

	mounted() {

	}

	beforeDestroy() {
		socket.offListener(this.onquote, this)
		socket.offListener(this.ondeal, this)
	}

	instrument = {} as Robinhood.Instrument
	ticker = {} as Webull.Ticker
	quote = {} as Webull.Quote
	deals = [] as Webull.Deal[]
	get vdeals() { return this.deals.filter((v, i) => i < 3) }

	@Vts.Watch('symbol', { immediate: true }) w_symbol(to: string, from: string) {
		socket.offListener(this.onquote, this)
		socket.offListener(this.ondeal, this)
		socket.on(`${rkeys.WB.QUOTES}:${this.symbol}`, this.onquote, this)
		socket.on(`${rkeys.WB.DEALS}:${this.symbol}`, this.ondeal, this)
		http.post('/symbols', {
			symbols: [this.symbol],
		}).then((response: any[]) => {
			console.log('response ->', JSON.parse(JSON.stringify(response)))
			this.instrument = response[0]
			this.ticker = response[1]
			this.quote = response[2]
		}).catch(error => console.error('symbols Error ->', error))

		http.post('/symbols/deals', {
			symbols: [this.symbol],
		}).then((response: Webull.Deal[][]) => {
			this.deals = response[0]
		}).catch(error => console.error('deals Error ->', error))

	}

	onquote(quote: Webull.Quote) {
		console.log('quote ->', quote)
	}
	ondeal(deal: Webull.Deal) {
		console.log('deal ->', deal)
	}

}


