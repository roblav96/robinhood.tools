// 

import * as Vts from 'vue-property-decorator'
import { mixins as Mixins } from 'vue-class-component'
import Vue from 'vue'
import VMixin from '@/client/mixins/v.mixin'
import * as _ from '@/common/lodash'
import * as core from '@/common/core'
import * as http from '@/client/adapters/http'



@Vts.Component
export default class Lists extends Mixins(VMixin) {

	created() {
		this.wblists()
	}

	lists = [
		{ name: 'Recently Viewed', symbols: this.$store.state.recents.slice(0, 10).map(v => v.symbol) },
	]

	wblists() {
		return http.get('https://securitiesapi.webull.com/api/securities/market/tabs/1/region/6').then((response: Webull.Api.HotLists) => {
			response.marketCategoryList.slice(0, 4).forEach(v => {
				this.lists.push({ name: v.name, symbols: v.tickerTupleArrayList.map(v => v.disSymbol) })
			})
			return this.syncquotes()
		}).catch(error => console.error(`created Error ->`, error))
	}

	wbquotes = [] as Webull.Quote[]

	syncquotes() {
		let symbols = _.uniq(_.flatten(this.lists.map(v => v.symbols)))
		return http.post('/symbols', { symbols, gets: [123] }).then(response => {
			console.log('response ->', response)
		})
	}

}


