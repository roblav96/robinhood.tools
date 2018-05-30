// 

import * as Vts from 'vue-property-decorator'
import { mixins as Mixins } from 'vue-class-component'
import Vue from 'vue'
import VMixin from '@/client/mixins/v.mixin'
import Symbol from './symbol'
import * as core from '@/common/core'



@Vts.Component
export default class extends Mixins(VMixin) {
	$parent: Symbol
	all = this.$parent.all
	deals = this.$parent.deals

	created() {
		console.log(`this.all ->`, this.all)
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


