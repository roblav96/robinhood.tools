// 

import * as Vts from 'vue-property-decorator'
import { mixins as Mixins } from 'vue-class-component'
import Vue from 'vue'
import VMixin from '@/client/mixins/v.mixin'
import * as _ from '@/common/lodash'
import * as core from '@/common/core'
import * as pretty from '@/common/pretty'
import * as rkeys from '@/common/rkeys'
import * as webull from '@/common/webull'
import * as hours from '@/common/hours'
import * as http from '@/client/adapters/http'
import * as utils from '@/client/adapters/utils'
import lockr from 'lockr'
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
	quote = {} as Quotes.Quote
	wbticker = {} as Webull.Ticker
	wbquote = {} as Webull.Quote
	instrument = {} as Robinhood.Instrument
	yhquote = {} as Yahoo.Quote
	iexitem = {} as Yahoo.Quote
	deals = [] as Quotes.Deal[]

	@Vts.Watch('price', { immediate: true }) w_price(price: number) {
		document.title = `${this.symbol} ${price} (${this.vnumber(this.percent, { plusminus: true, percent: true })})`
	}

	get name() { return this.instrument.simple_name || this.instrument.name }
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

	// get price() { return this.wbquote.faTradeTime > this.wbquote.mktradeTime ? this.wbquote.pPrice : this.wbquote.price }
	// get change() { return this.wbquote.faTradeTime > this.wbquote.mktradeTime ? this.wbquote.pChange : this.wbquote.change }
	// get percent() { return this.wbquote.faTradeTime > this.wbquote.mktradeTime ? this.wbquote.pChRatio * 100 : this.wbquote.changeRatio * 100 }
	// get marketcap() { return this.wbquote.totalShares * this.price }

	get baprice() {
		if (Object.keys(this.quote).length == 0) return { bid: 0, ask: 0 };
		let max = this.quote.askPrice - this.quote.bidPrice
		let price = this.quote.price
		let bid = core.calc.slider(price - this.quote.bidPrice, 0, max)
		let ask = core.calc.slider(this.quote.askPrice - price, 0, max)
		return { bid, ask }
	}
	get balot() {
		if (Object.keys(this.quote).length == 0) return { bid: 0, ask: 0 };
		let max = this.quote.bidLot + this.quote.askLot
		let bid = core.calc.slider(this.quote.bidLot, 0, max)
		let ask = core.calc.slider(this.quote.askLot, 0, max)
		return { bid, ask }
	}

	reset() {
		this.busy = true
		socket.offListener(this.onquote, this)
		socket.offListener(this.ondeal, this)
		core.nullify(this.quote)
		core.nullify(this.wbticker)
		core.nullify(this.wbquote)
		core.nullify(this.instrument)
		core.nullify(this.yhquote)
		core.nullify(this.iexitem)
		core.nullify(this.deals)
	}

	@Vts.Watch('symbol', { immediate: true }) w_symbol(to: string, from: string) {
		this.reset()
		let symbols = [this.symbol]
		Promise.all([
			http.post('/symbols/rkeys', { symbols }).then(response => {
				console.log(this.symbol, 'response ->', JSON.parse(JSON.stringify(response)))
				core.object.merge(this, _.omit(response[0], ['symbol']))
				this.busy = false
			}),
			http.post('/symbols/deals', { symbols }).then(response => {
				this.deals = response[0]
			}),
		]).catch(error => {
			console.error('w_symbol Error ->', error)
		}).finally(() => {
			socket.on(`${rkeys.QUOTES}:${this.symbol}`, this.onquote, this)
			socket.on(`${rkeys.DEALS}:${this.symbol}`, this.ondeal, this)
		})
	}

	onquote(quote: Quotes.Quote) {
		// console.log(`quote ->`, JSON.stringify(quote, null, 4))
		core.object.merge(this.quote, quote)
	}
	ondeal(deal: Quotes.Deal) {
		// console.log(`deal ->`, JSON.stringify(deal, null, 4))
		this.deals.unshift(deal)
		this.deals.splice(20)
	}

}


