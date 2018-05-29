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



@Vts.Component
export default class extends Mixins(VMixin) {

	get symbol() { return this.$route.params.symbol }

	created() {

	}

	mounted() {
		// clock.on('1s', () => this.quote.price = _.round(this.quote.price + _.random(-1, 1, true), 2))
	}

	beforeDestroy() {
		this.reset()
	}

	get routes() { return this.$router.options.routes.find(v => v.name == 'symbol').children.filter(v => v.icon) }

	busy = true
	quote = {} as Quotes.Quote
	wbticker = {} as Webull.Ticker
	wbquote = {} as Webull.Quote
	instrument = {} as Robinhood.Instrument
	yhquote = {} as Yahoo.Quote
	iexitem = {} as Yahoo.Quote
	deals = [] as Quotes.Deal[]

	@Vts.Watch('quote.price', { immediate: true }) w_price(price: number) {
		document.title = `${this.symbol} ${this.vnumber(price)} (${this.vnumber(this.quote.percent, { plusminus: true, percent: true })})`
	}

	get vdeals() { return this.deals.filter((v, i) => i < 10) }
	dealcolor(deal: Quotes.Deal) { return { 'has-text-success': deal.side == 'B', 'has-text-danger': deal.side == 'S' } }

	get delisted() { return webull.ticker_status[this.wbquote.status] == webull.ticker_status.DELISTED }
	get suspended() { return webull.ticker_status[this.wbquote.status] == webull.ticker_status.SUSPENSION }
	get isexthours() { return this.$store.state.hours.state != 'REGULAR' }
	get exthours() {
		let state = hours.getState(this.$store.state.hours.hours, this.wbquote.faTradeTime)
		if (state.includes('PRE')) return 'Pre Market';
		if (state.includes('POST')) return 'After Hours';
		return state
	}

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
			http.post('/quotes/alls', { symbols }).then((response: Quotes.All[]) => {
				console.log(this.symbol, '/quotes/alls response ->', JSON.parse(JSON.stringify(response)))
				core.object.merge(this, _.omit(response[0], ['symbol']) as any)
			}),
			http.post('/quotes/deals', { symbols }).then(response => {
				this.deals = response[0]
			}),
		]).catch(error => {
			console.error('w_symbol Error ->', error)
		}).finally(() => {
			this.busy = false
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
	}

}


