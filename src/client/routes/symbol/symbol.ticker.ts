// 

import * as Vts from 'vue-property-decorator'
import { mixins as Mixins } from 'vue-class-component'
import Vue from 'vue'
import VMixin from '@/client/mixins/v.mixin'
import Symbol from './symbol'
import * as core from '@/common/core'
import * as rkeys from '@/common/rkeys'
import * as http from '@/client/adapters/http'
import socket from '@/client/adapters/socket'



@Vts.Component
export default class extends Mixins(VMixin) {
	$parent: Symbol

	symbol = this.$parent.symbol
	all = this.$parent.all
	deals = [] as Quotes.Deal[]

	created() {
		this.syncdeals()
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
			let max = this.all.quote.askPrice - this.all.quote.bidPrice
			bidask.bid.price = core.calc.slider(this.all.quote.price - this.all.quote.bidPrice, 0, max)
			bidask.ask.price = core.calc.slider(this.all.quote.askPrice - this.all.quote.price, 0, max)
		}
		{
			let max = this.all.quote.bidLot + this.all.quote.askLot
			bidask.bid.size = core.calc.slider(this.all.quote.bidLot, 0, max)
			bidask.ask.size = core.calc.slider(this.all.quote.askLot, 0, max)
		}
		return bidask
	}

}


