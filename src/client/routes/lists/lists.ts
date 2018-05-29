// 

import * as Vts from 'vue-property-decorator'
import { mixins as Mixins } from 'vue-class-component'
import Vue from 'vue'
import VMixin from '@/client/mixins/v.mixin'
import RHMixin from '@/client/mixins/robinhood.mixin'
import * as _ from '@/common/lodash'
import * as core from '@/common/core'
import * as rkeys from '@/common/rkeys'
import * as webull from '@/common/webull'
import * as http from '@/client/adapters/http'
import * as robinhood from '@/client/adapters/robinhood'
import lockr from 'lockr'
import clock from '@/common/clock'
import socket from '@/client/adapters/socket'



@Vts.Component({
	beforeRouteEnter(to, from, next) {
		console.log(`to ->`, to)
		return next()
	},
})
export default class Lists extends Mixins(VMixin, RHMixin) {

	created() {
		this.synclists().then(this.syncsymbols)
		// Promise.resolve().then(() => {
		// 	if (this.lists.length) return this.syncsymbols();
		// }).then(() => this.synclists().then(this.syncsymbols))
	}

	beforeDestroy() {
		socket.offListener(this.onquote, this)
		core.nullify(this.quotes)
	}

	busy = true
	defaultOpenedDetails = [1]
	lists = lockr.get('lists.lists', [] as { name: string, symbols: string[] }[])
	quotes = {} as Dict<Quotes.Quote>

	tabledata(symbols: string[]) {
		return symbols.map(v => this.quotes[v] || { symbol: v } as Quotes.Quote)
	}

	synclists() {
		let lists = [{ name: 'Recently Viewed', symbols: this.recents.slice(0, 10).map(v => v.symbol) }]
		return Promise.all([
			this.rhusername && robinhood.sync({ synckeys: ['watchlists'] }).then(response => {
				lists.push({
					name: 'Robinhood Watchlist',
					symbols: response.watchlists.map(v => v.symbol),
				})
			}),
			http.get('https://securitiesapi.webull.com/api/securities/market/tabs/1/region/6').then((response: Webull.Api.HotLists) => {
				response.marketCategoryList.slice(0, 4).forEach(v => {
					lists.push({
						name: v.name, symbols: v.tickerTupleArrayList.map(v => {
							v.disSymbol = webull.fixSymbol(v.disSymbol)
							return v.disSymbol
						})
					})
				})
			}),
		]).catch(error => {
			console.error(`synclists Error ->`, error)
		}).finally(() => {
			lockr.set('lists.lists', lists)
			this.lists = lists
		})
	}

	syncsymbols() {
		let symbols = _.uniq(_.flatten(this.lists.map(v => v.symbols)))
		return http.post('/quotes/alls', {
			symbols, types: ['quote'] as Quotes.AllKeys[],
		}).then((response: Quotes.All[]) => {
			socket.offListener(this.onquote, this)
			response.forEach(v => {
				this.$set(this.quotes, v.symbol, v.quote)
				socket.on(`${rkeys.QUOTES}:${v.symbol}`, this.onquote, this)
			})
		}).catch(error => {
			console.error(`syncsymbols Error ->`, error)
		}).finally(() => {
			this.$nextTick(() => this.busy = false)
		})
	}

	onquote(toquote: Quotes.Quote) {
		let quote = this.quotes[toquote.symbol]
		quote ? core.object.merge(quote, toquote) : this.quotes[toquote.symbol] = toquote
	}

	gotosymbol(symbol: string) {
		this.$router.push({ name: 'symbol', params: { symbol } })
	}

}


