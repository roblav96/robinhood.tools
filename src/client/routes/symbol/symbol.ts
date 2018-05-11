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
import clock from '@/common/clock'
import socket from '@/client/adapters/socket'



const { components, tabs } = new ui.Tabs('symbol', [{
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
	components,
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

	tabs = tabs
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
		clock.on('1s', this.$forceUpdate, this)
	}

	beforeDestroy() {
		clock.offListener(this.$forceUpdate, this)
		socket.offListener(this.onquote, this)
		socket.offListener(this.ondeal, this)
		this.reset()
	}

	busy = true
	instrument = {} as Robinhood.Instrument
	ticker = {} as Webull.Ticker
	quote = {} as Webull.Quote
	deals = [] as Webull.Deal[]

	get vdeals() { return this.deals.filter((v, i) => i < 3) }
	get change() {
		let change = { c: this.quote.change, r: this.quote.changeRatio }
		return change
	}

	reset() {
		this.busy = true
		this.instrument = {} as any
		this.ticker = {} as any
		this.quote = {} as any
		this.deals.splice(0)
	}

	@Vts.Watch('symbol', { immediate: true }) w_symbol(to: string, from: string) {
		socket.offListener(this.onquote, this)
		socket.offListener(this.ondeal, this)
		socket.on(`${rkeys.WB.QUOTES}:${this.symbol}`, this.onquote, this)
		socket.on(`${rkeys.WB.DEALS}:${this.symbol}`, this.ondeal, this)
		this.reset()

		let symbols = [this.symbol]
		return Promise.all([
			http.post('/symbols', { symbols }),
			http.post('/symbols/deals', { symbols }),
		]).then(resolved => {
			console.log('resolved ->', JSON.parse(JSON.stringify(resolved)))
			this.instrument = resolved[0][0]
			this.ticker = resolved[0][1]
			this.quote = resolved[0][2]
			this.deals = resolved[1][0]
			this.busy = false
		}).catch(error => console.error('w_symbol Error ->', error))
	}

	onquote(quote: Webull.Quote) {
		Object.assign(this.quote, quote)
	}
	dealcolor(deal: Webull.Deal) {
		return { 'has-text-success': deal.tradeBsFlag == 'B', 'has-text-danger': deal.tradeBsFlag == 'S' }
	}
	ondeal(deal: Webull.Deal) {
		this.deals.unshift(deal)
		this.deals.splice(20)
	}

}


