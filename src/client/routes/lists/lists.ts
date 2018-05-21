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



@Vts.Component
export default class Lists extends Mixins(VMixin, RHMixin) {

	created() {
		this.synclists().then(this.syncsymbols)
	}

	lists = [] as { name: string, symbols: string[] }[]
	synclists() {
		this.lists = [{ name: 'Recently Viewed', symbols: this.recents.slice(0, 20).map(v => v.symbol) }]
		if (this.rh.positions.length > 0) {
			this.lists.push({ name: 'Robinhood Positions', symbols: this.rh.positions.map(v => v.symbol) })
		}
		return Promise.all([
			!this.rhusername ? Promise.resolve() : robinhood.sync({ synckeys: ['watchlists'] }).then(response => {
				this.lists.push({
					name: 'Robinhood Watchlist',
					symbols: response.watchlists.map(v => v.symbol),
				})
			}),
			http.get('https://securitiesapi.webull.com/api/securities/market/tabs/1/region/6').then((response: Webull.Api.HotLists) => {
				response.marketCategoryList.slice(0, 4).forEach(v => {
					this.lists.push({ name: v.name, symbols: v.tickerTupleArrayList.map(v => v.disSymbol) })
				})
			})
		]).catch(error => console.error(`synclists Error ->`, error))
	}

	instruments = [] as Robinhood.Instrument[]
	wbquotes = [] as Webull.Quote[]

	syncsymbols() {
		console.log(`this ->`, this)
		let symbols = _.uniq(_.flatten(this.lists.map(v => v.symbols)))
		return http.post('/symbols/rkeys', {
			symbols, rkeys: [rkeys.RH.INSTRUMENTS, rkeys.WB.QUOTES],
		}).then((response: any[]) => {
			response.forEach(v => {
				this.instruments.push(v.instrument)
				this.wbquotes.push(v.wbquote)
			})
		}).catch(error => console.error(`syncsymbols Error ->`, error))
	}

}


