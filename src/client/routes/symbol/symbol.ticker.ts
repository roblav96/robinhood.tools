// 

import * as Vts from 'vue-property-decorator'
import { mixins as Mixins } from 'vue-class-component'
import Vue from 'vue'
import VMixin from '@/client/mixins/v.mixin'
import Symbol from './symbol'
import * as _ from '@/common/lodash'
import * as core from '@/common/core'
import * as rkeys from '@/common/rkeys'
import * as http from '@/client/adapters/http'
import * as utils from '@/client/adapters/utils'
import socket from '@/client/adapters/socket'



@Vts.Component
export default class extends Mixins(VMixin) {
	$parent: Symbol
	symbol = this.$parent.symbol
	all = this.$parent.all

	deals = [] as Quotes.Deal[]

	created() {
		// this.syncdeals()
	}

	beforeDestroy() {
		socket.offListener(this.ondeal, this)
		this.deals.splice(0)
	}

	syncdeals() {
		return http.post('/quotes/deals', { symbols: [this.symbol] }).then(response => {
			this.deals = response[0]
			socket.offListener(this.ondeal, this)
			socket.on(`${rkeys.DEALS}:${this.symbol}`, this.ondeal, this)
		})
	}
	ondeal(deal: Quotes.Deal) {
		// console.log(`deal ->`, JSON.stringify(deal, null, 4))
		this.deals.unshift(deal)
	}

	get bidask() {
		let bidask = { bid: { price: 0, size: 0 }, ask: { price: 0, size: 0 } }
		if (Object.keys(this.all.quote).length == 0) return bidask;
		{
			let max = this.all.quote.ask - this.all.quote.bid
			bidask.bid.price = core.calc.slider(this.all.quote.price - this.all.quote.bid, 0, max)
			bidask.ask.price = core.calc.slider(this.all.quote.ask - this.all.quote.price, 0, max)
		}
		{
			let max = this.all.quote.bids + this.all.quote.asks
			bidask.bid.size = core.calc.slider(this.all.quote.bids, 0, max)
			bidask.ask.size = core.calc.slider(this.all.quote.asks, 0, max)
		}
		return bidask
	}

	states = [
		{ name: '4am to 8pm', icon: 'theme-light-dark', key: '', calc: 'startPrice', tip: 'Price at start of day (4:00am)' },
		{ name: 'Pre Market', icon: 'weather-sunset-up', key: 'pre', calc: 'startPrice', tip: 'Price at start of day (4:00am)' },
		{ name: 'Regular', icon: 'weather-sunny', key: 'reg', calc: 'openPrice', tip: 'Price at market open (9:30am)' },
		{ name: 'After Hours', icon: 'weather-sunset-down', key: 'post', calc: 'closePrice', tip: 'Price at market close (4:00pm)' },
	]

}


