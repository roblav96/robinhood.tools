// 

import * as Vts from 'vue-property-decorator'
import { mixins as Mixins } from 'vue-class-component'
import Vue from 'vue'
import VMixin from '../../mixins/v.mixin'
import * as _ from '../../../common/lodash'
import * as core from '../../../common/core'
import * as http from '../../../common/http'
import * as webull from '../../../common/webull'
import * as quotes from '../../../common/quotes'
import * as pretty from '../../adapters/pretty'
import * as utils from '../../adapters/utils'



@Vts.Component
export default class extends Mixins(VMixin) {

	mounted() {
		this.sync()
		utils.wemitter.on('keyup', this.onkey, this)
		utils.wemitter.on('keydown', this.onkey, this)
	}
	beforeDestroy() {
		utils.wemitter.off('keyup', this.onkey, this)
		utils.wemitter.off('keydown', this.onkey, this)
	}

	onkey(event: KeyboardEvent) {
		if (event.metaKey || event.shiftKey || event.ctrlKey || event.altKey) return;
		if (event.type == 'keyup') {
			if (event.key == 'Escape' && document.activeElement.outerHTML == this.inputfield.outerHTML) {
				this.inputfield.blur()
			}
			if (event.key == '/' && document.activeElement.tagName != 'INPUT') {
				this.inputfield.focus()
			}
		}
		if (event.type == 'keydown' && document.activeElement.tagName != 'INPUT') {
			if (event.code.startsWith('Key')) {
				this.inputfield.focus()
				this.query = (this.query || '') + event.key
			}
		}
	}

	get autocomplete() { return this.$refs.searchbar_autocomplete as Vue }
	get inputfield() { return this.autocomplete.$el.querySelector('input') }
	scrolltop(behavior = 'smooth' as ScrollBehavior) {
		let el = this.autocomplete.$el.querySelector('div.dropdown-menu > div.dropdown-content') as HTMLElement
		el.scrollTo({ top: 0, behavior })
	}

	query = ''
	results = [] as Quotes.Quote[]

	oninput = _.debounce(this.sync, 1, { leading: false, trailing: true })
	sync(query = this.query) {
		return Promise.resolve().then(() => {
			if (!this.query) return http.post('/recents', { symbols: this.recents.map(v => v.symbol) });
			return http.get('/search', { query: { query: this.query } })
			// return onquery(query)
		}).then(results => {
			console.log(`results ->`, JSON.parse(JSON.stringify(results)))
			this.$safety()
			if (this.query == query) {
				this.results = results
			}
			this.$nextTick(() => this.scrolltop())
		}).catch(error => console.error('sync Error ->', error))
	}

	onfocus() {
		this.$nextTick(() => this.scrolltop('instant'))
		if (this.query) {
			this.inputfield.setSelectionRange(0, this.inputfield.value.length)
		}
	}
	onblur() {

	}

	onselect(result: Quotes.Quote) {
		this.$router.push({ name: this.$routersymbolname, params: { symbol: result.symbol } })
		this.inputfield.blur()
		if (!this.query) this.sync();
	}

	voption(result) {
		return _.omit(result, ['symbol', 'name', 'rank'])
	}

}





// const ALLS = [{ "symbol": "MU", "quote": { "name": "Micron Technology, Inc.", "symbol": "MU" } }, { "symbol": "AAPL", "quote": { "name": "Apple Inc.", "symbol": "AAPL" } }, { "symbol": "SPY", "quote": { "name": "SPDR S&P 500", "symbol": "SPY" } }, { "symbol": "NVDA", "quote": { "name": "NVIDIA Corporation", "symbol": "NVDA" } }, { "symbol": "AMD", "quote": { "name": "Advanced Micro Devices, Inc.", "symbol": "AMD" } }, { "symbol": "FB", "quote": { "name": "Facebook, Inc.", "symbol": "FB" } }, { "symbol": "BAC", "quote": { "name": "Bank of America Corporation", "symbol": "BAC" } }, { "symbol": "BABA", "quote": { "name": "Alibaba Group Holding Limited", "symbol": "BABA" } }, { "symbol": "INTC", "quote": { "name": "Intel Corporation", "symbol": "INTC" } }, { "symbol": "MSFT", "quote": { "name": "Microsoft Corporation", "symbol": "MSFT" } }, { "symbol": "GE", "quote": { "name": "General Electric Company", "symbol": "GE" } }, { "symbol": "SQ", "quote": { "name": "Square, Inc.", "symbol": "SQ" } }, { "symbol": "ROKU", "quote": { "name": "Roku, Inc.", "symbol": "ROKU" } }, { "symbol": "UVXY", "quote": { "name": "ProShares Trust Ultra VIX Short", "symbol": "UVXY" } }, { "symbol": "NFLX", "quote": { "name": "Netflix, Inc.", "symbol": "NFLX" } }] as Quotes.All[]
// const QUOTES = ALLS.map(all => ({
// 	_symbol: all.symbol,
// 	symbol: core.string.alphanumeric(all.symbol).toLowerCase(),
// 	name: core.string.alphanumeric(pretty.company(all.quote.name)).toLowerCase(),
// })) as Partial<Quotes.Quote & { _symbol: string }>[]

// function onquery(query: string) {
// 	query = core.string.alphanumeric(query).toLowerCase()
// 	console.log('query ->', query)
// 	let results = QUOTES.map(({ _symbol, symbol, name }, i) => {

// 		let s_leven = core.string.levenshtein(query, symbol)
// 		let s_rank = Math.max(symbol.length - s_leven, 0) * query.length

// 		let n_leven = core.string.levenshtein(query, name)
// 		let n_rank = Math.max(name.length - n_leven, 0)

// 		return {
// 			symbol: _symbol, name,
// 			s_length: symbol.length, s_leven, s_rank,
// 			n_length: name.length, n_leven, n_rank,
// 			rank: Math.max(s_rank, 1) * Math.max(n_rank, 1),
// 			// rank: s_rank + n_rank,
// 		}

// 	}).sort((a, b) => b.rank - a.rank).slice(0, 20)
// 	return results
// }


