// 

import * as Vts from 'vue-property-decorator'
import { mixins as Mixins } from 'vue-class-component'
import Vue from 'vue'
import lockr from 'lockr'
import VMixin from '@/client/mixins/v.mixin'
import * as _ from '@/common/lodash'
import * as core from '@/common/core'
import * as pretty from '@/common/pretty'
import * as rkeys from '@/common/rkeys'
import * as webull from '@/common/webull'
import * as hours from '@/common/hours'
import * as http from '@/client/adapters/http'
import * as utils from '@/client/adapters/utils'
import clock from '@/common/clock'
import socket from '@/client/adapters/socket'



const { components, tabs } = new utils.Tabs('symbol', [{
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
}, {
	id: 'calcs',
	icon: 'calculator',
	component: () => import('@/client/routes/symbol/symbol.calcs'),
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
		this.reset()
	}

	busy = true
	instrument = {} as Robinhood.Instrument
	ticker = {} as Webull.Ticker
	wbquote = {} as Webull.Quote
	yhquote = {} as Yahoo.Quote
	deals = [] as Webull.Deal[]

	@Vts.Watch('price', { immediate: true }) w_price(price: number) {
		document.title = `${this.symbol} ${price} (${this.vnumber(this.percent, { plusminus: true, percent: true })})`
	}

	get name() { return this.instrument.simple_name || this.instrument.name }
	// get name() { return core.string.capitalize(core.string.minify(this.yhquote.shortName || this.instrument.simple_name || this.instrument.name)) }
	// get name() {
	// 	let names = _.uniq(_.compact([this.instrument.simple_name, this.yhquote.shortName, this.instrument.name, this.yhquote.longName]))
	// 	let min = _.min(names.map(v => v.length))
	// 	return names.find(v => v.length == min) || names[0]
	// }
	get vdeals() { return this.deals.filter((v, i) => i < 4) }
	dealcolor(deal: Webull.Deal) { return { 'has-text-success': deal.tradeBsFlag == 'B', 'has-text-danger': deal.tradeBsFlag == 'S' } }

	get delisted() { return webull.ticker_status[this.wbquote.status] == webull.ticker_status.DELISTED }
	get suspended() { return webull.ticker_status[this.wbquote.status] == webull.ticker_status.SUSPENSION }
	get isexthours() { return this.$store.state.hours.state != 'REGULAR' }
	get exthours() {
		let state = hours.getState(this.$store.state.hours.hours, this.wbquote.faTradeTime)
		if (state.includes('PRE')) return 'Pre Market';
		if (state.includes('POST')) return 'After Hours';
		return state
	}

	get price() { return this.wbquote.faTradeTime > this.wbquote.mktradeTime ? this.wbquote.pPrice : this.wbquote.price }
	get change() { return this.wbquote.faTradeTime > this.wbquote.mktradeTime ? this.wbquote.pChange : this.wbquote.change }
	get percent() { return this.wbquote.faTradeTime > this.wbquote.mktradeTime ? this.wbquote.pChRatio * 100 : this.wbquote.changeRatio * 100 }
	get marketcap() { return this.wbquote.totalShares * this.price }

	get baprice() {
		if (Object.keys(this.wbquote).length == 0) return { bid: 0, ask: 0 };
		let max = this.wbquote.ask - this.wbquote.bid
		let price = this.price
		let bid = core.calc.slider(price - this.wbquote.bid, 0, max)
		let ask = core.calc.slider(this.wbquote.ask - price, 0, max)
		return { bid, ask }
	}
	get basize() {
		if (Object.keys(this.wbquote).length == 0) return { bid: 0, ask: 0 };
		let max = this.wbquote.bidSize + this.wbquote.askSize
		let bid = core.calc.slider(this.wbquote.bidSize, 0, max)
		let ask = core.calc.slider(this.wbquote.askSize, 0, max)
		return { bid, ask }
	}

	reset() {
		socket.offListener(this.onwbquote, this)
		socket.offListener(this.ondeal, this)
		this.busy = true
		this.instrument = {} as any
		this.ticker = {} as any
		this.wbquote = {} as any
		this.yhquote = {} as any
		this.deals.splice(0)
	}

	@Vts.Watch('symbol', { immediate: true }) w_symbol(to: string, from: string) {
		this.reset()
		let symbols = [this.symbol]
		Promise.all([
			http.post('/symbols', { symbols }).then(response => {
				console.log('response ->', JSON.parse(JSON.stringify(response)))
				this.instrument = response[0]
				this.ticker = response[1]
				this.wbquote = response[2]
				this.yhquote = response[3]
				this.busy = false
			}),
			http.post('/symbols/deals', { symbols }).then(response => {
				this.deals = response[0]
			}),
		]).catch(error => console.error('w_symbol Error ->', error)).finally(() => {
			socket.on(`${rkeys.WB.QUOTES}:${this.symbol}`, this.onwbquote, this)
			socket.on(`${rkeys.WB.DEALS}:${this.symbol}`, this.ondeal, this)
		})
	}

	onwbquote(wbquote: Webull.Quote) {
		Object.assign(this.wbquote, wbquote)
	}
	ondeal(deal: Webull.Deal) {
		this.deals.unshift(deal)
		this.deals.splice(20)
	}

}


