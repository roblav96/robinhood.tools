// 

import * as Vts from 'vue-property-decorator'
import { mixins as Mixins } from 'vue-class-component'
import Vue from 'vue'
import VMixin from '@/client/mixins/v.mixin'
import RHMixin from '@/client/mixins/robinhood.mixin'
import * as _ from '@/common/lodash'
import * as core from '@/common/core'
import * as rkeys from '@/common/rkeys'
import * as http from '@/client/adapters/http'
import * as robinhood from '@/client/adapters/robinhood'
import lockr from 'lockr'
import clock from '@/common/clock'
import socket from '@/client/adapters/socket'



@Vts.Component
export default class Lists extends Mixins(VMixin, RHMixin) {

	created() {
		this.lists = [{ name: 'Recently Viewed', symbols: this.recents.slice(0, 10).map(v => v.symbol) }]
		this.syncsymbols()
		clock.on('1s', this.syncsymbols, this)
		// this.synclists().then(() => {
		// 	clock.on('1s', this.syncsymbols, this)
		// 	// return this.syncsymbols()
		// })
	}

	beforeDestroy() {
		clock.offListener(this.syncsymbols, this)
		// socket.offListener(this.onwbquote, this)
		lockr.set('lists.lists', this.lists)
	}

	lists = lockr.get('lists.lists', [] as { name: string, symbols: string[] }[])
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
					lists.push({ name: v.name, symbols: v.tickerTupleArrayList.map(v => v.disSymbol) })
				})
			})
		]).then(() => this.lists = lists).catch(error => console.error(`synclists Error ->`, error))
	}

	instruments = [] as Robinhood.Instrument[]
	wbquotes = [] as Webull.Quote[]

	tabledata(symbols: string[]) {
		return this.wbquotes.filter(v => symbols.includes(v.symbol))
	}

	syncsymbols() {
		let symbols = _.uniq(_.flatten(this.lists.map(v => v.symbols)))
		return http.post('/symbols/rkeys', {
			symbols, rkeys: [rkeys.RH.INSTRUMENTS, rkeys.WB.QUOTES],
		}).then((response: any[]) => {
			response.forEach(v => {
				this.onitem('instruments', v.instrument)
				this.onitem('wbquotes', v.wbquote)
				// this.instruments.push(v.instrument)
				// this.wbquotes.push(v.wbquote)
			})
			// socket.offListener(this.onwbquote, this)
			// symbols.forEach(v => socket.on(`${rkeys.WB.QUOTES}:${v}`, this.onwbquote, this))
		}).catch(error => console.error(`syncsymbols Error ->`, error))
	}

	onitem(key: string, item: any) {
		let found = this[key].find(v => v.symbol == item.symbol)
		// console.log(`found ->`, found)
		found ? Object.assign(found, item) : this[key].push(item)
	}

	// onwbquote(wbquote: Webull.Quote) {
	// 	let found = this.wbquotes.find(v => v.symbol == wbquote.symbol)
	// 	// console.log(`found ->`, found)
	// 	found ? Object.assign(found, wbquote) : this.wbquotes.push(wbquote)
	// }

	gotosymbol(symbol: string) {
		this.$router.push({ name: 'symbol', params: { symbol } })
	}

}


