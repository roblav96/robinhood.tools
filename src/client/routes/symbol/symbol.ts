// 

import * as Vts from 'vue-property-decorator'
import { mixins as Mixins } from 'vue-class-component'
import Vue from 'vue'
import VMixin from '@/client/mixins/v.mixin'
import * as _ from '@/common/lodash'
import * as core from '@/common/core'
import * as rkeys from '@/common/rkeys'
import * as quotes from '@/common/quotes'
import * as http from '@/client/adapters/http'
import clock from '@/common/clock'
import socket from '@/client/adapters/socket'



@Vts.Component({
	components: {
		'symbol-ticker': () => import('@/client/routes/symbol/symbol.ticker'),
	},
})
export default class VSymbol extends Mixins(VMixin) {

	get symbol() { return this.$route.params.symbol }

	mounted() {
		// clock.on('1s', () => this.all.quote.price = _.round(this.all.quote.price + _.random(-1, 1, true), 2))
	}

	beforeDestroy() {
		this.reset()
	}

	get routes() { return this.$router.options.routes.find(v => v.name == 'symbol').children.filter(v => v.icon) }

	busy = true
	showticker = true
	all = core.array.dict(Object.keys(quotes.ALL_KEYS), {} as any) as Quotes.All

	@Vts.Watch('all.quote.price', { immediate: true }) w_price(price: number) {
		document.title = `${this.symbol} ${this.vnumber(price)} (${this.vnumber(this.all.quote.percent, { plusminus: true, percent: true })})`
	}

	reset() {
		this.busy = true
		socket.offListener(this.onquote, this)
		core.nullify(this.all)
	}

	@Vts.Watch('symbol', { immediate: true }) w_symbol(to: string, from: string) {
		this.reset()
		return http.post('/quotes/alls', { symbols: [this.symbol] }).then((response: Quotes.All[]) => {
			console.log(this.symbol, '/quotes/alls response ->', JSON.parse(JSON.stringify(response)))
			core.object.merge(this.all, _.omit(response[0], ['symbol']) as any)
		}).catch(error => {
			console.error('w_symbol Error ->', error)
		}).finally(() => {
			this.busy = false
			socket.on(`${rkeys.QUOTES}:${this.symbol}`, this.onquote, this)
		})
	}

	onquote(quote: Quotes.Quote) {
		// console.log(`quote ->`, JSON.stringify(quote, null, 4))
		core.object.merge(this.all.quote, quote)
	}

	// @Vts.Watch('$route.name') w_$routename(name: string) {
	// 	if (!name.includes('symbol.')) return;
	// 	this.details = false
	// }

}


