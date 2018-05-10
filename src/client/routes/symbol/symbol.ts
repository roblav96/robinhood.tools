// 

import * as Vts from 'vue-property-decorator'
import { mixins as Mixins } from 'vue-class-component'
import { Route } from 'vue-router'
import Vue from 'vue'
import * as rkeys from '@/common/rkeys'
import * as http from '@/client/adapters/http'
import socket from '@/client/adapters/socket'



@Vts.Component
export default class extends Vue {

	get symbol() { return this.$route.params.symbol }

	mounted() {

	}

	beforeDestroy() {
		socket.offListener(this.onquote, this)
		socket.offListener(this.ondeal, this)
	}

	instrument = {} as Robinhood.Instrument
	ticker = {} as Webull.Ticker
	quote = {} as Webull.Quote

	@Vts.Watch('symbol', { immediate: true }) w_symbol(to: string, from: string) {
		socket.offListener(this.onquote, this)
		socket.on(`${rkeys.WB.QUOTES}:${this.symbol}`, this.onquote, this)
		socket.offListener(this.ondeal, this)
		socket.on(`${rkeys.WB.DEALS}:${this.symbol}`, this.ondeal, this)
		http.post('/onsymbol', { symbols: [this.symbol] }).then(response => {
			this.instrument = response[0].instrument
			this.ticker = response[0].ticker
			this.quote = response[0].quote
		}).catch(error => console.error('onsymbol Error ->', error))
	}

	onquote(quote: Webull.Quote) {
		console.log('quote ->', quote)
	}
	ondeal(deal: Webull.Deal) {
		console.log('deal ->', deal)
	}

}


