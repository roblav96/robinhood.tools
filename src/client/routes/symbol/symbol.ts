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
	}

	quote = {} as Quote

	@Vts.Watch('symbol', { immediate: true }) w_symbol(to: string, from: string) {
		socket.offListener(this.onquote, this)
		socket.on(`${rkeys.QUOTES}:${this.symbol}`, this.onquote, this)
		http.post('/quotes', { symbols: [this.symbol] }).then(quotes => {
			this.quote = quotes[0]
		}).catch(function(error) {
			console.error('w_symbol Error ->', error)
		})
	}

	onquote(quote: Webull.Quote) {
		console.log('quote ->', quote)
	}

}


