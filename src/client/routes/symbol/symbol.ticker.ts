// 

import * as Vts from 'vue-property-decorator'
import { mixins as Mixins } from 'vue-class-component'
import Vue from 'vue'
import Symbol from './symbol'
import VMixin from '../../mixins/v.mixin'
import * as _ from '../../../common/lodash'
import * as core from '../../../common/core'
import * as rkeys from '../../../common/rkeys'
import * as http from '../../../common/http'
import * as utils from '../../adapters/utils'
import socket from '../../adapters/socket'



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

	states = [
		{ name: '4am to 8pm', icon: 'theme-light-dark', key: '', calc: 'startPrice', tip: 'Price at start of day (4:00am)' },
		{ name: 'Pre Market', icon: 'weather-sunset-up', key: 'pre', calc: 'startPrice', tip: 'Price at start of day (4:00am)' },
		{ name: 'Regular', icon: 'weather-sunny', key: 'reg', calc: 'openPrice', tip: 'Price at market open (9:30am)' },
		{ name: 'After Hours', icon: 'weather-sunset-down', key: 'post', calc: 'closePrice', tip: 'Price at market close (4:00pm)' },
	]

}


