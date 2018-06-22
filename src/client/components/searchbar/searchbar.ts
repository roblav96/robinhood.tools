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

	created() {
		this.sync()
	}
	mounted() {
		utils.wemitter.on('keyup', this.onkey, this)
		utils.wemitter.on('keydown', this.onkey, this)
		if (process.env.DEVELOPMENT) this.inputfield.focus();
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
			// return http.get('/search', { query: { query: this.query } })
			return onquery(query)
		}).then(results => {
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
		return _.omit(result, ['symbol', 'name', 'tinyName'])
	}

}





const ALLS = [{ "symbol": "MU", "quote": { "name": "Micron Technology, Inc." } }, { "symbol": "AAPL", "quote": { "name": "Apple Inc." } }, { "symbol": "SPY", "quote": { "name": "SPDR S&P 500 ETF" } }, { "symbol": "NVDA", "quote": { "name": "NVIDIA Corporation" } }, { "symbol": "AMD", "quote": { "name": "Advanced Micro Devices, Inc." } }, { "symbol": "FB", "quote": { "name": "Facebook, Inc." } }, { "symbol": "BAC", "quote": { "name": "Bank of America Corporation" } }, { "symbol": "BABA", "quote": { "name": "Alibaba Group Holding Limited" } }, { "symbol": "INTC", "quote": { "name": "Intel Corporation" } }, { "symbol": "MSFT", "quote": { "name": "Microsoft Corporation" } }, { "symbol": "GE", "quote": { "name": "General Electric Company" } }, { "symbol": "SQ", "quote": { "name": "Square, Inc." } }, { "symbol": "ROKU", "quote": { "name": "Roku, Inc." } }, { "symbol": "UVXY", "quote": { "name": "ProShares Ultra VIX Short-Term Futures" } }, { "symbol": "NFLX", "quote": { "name": "Netflix, Inc." } }] as Quotes.All[]

const QUOTES = ALLS.map(all => ({
	_symbol: all.symbol,
	symbol: core.string.alphanumeric(all.symbol).toLowerCase(),
	name: core.string.alphanumeric(pretty.company(all.quote.name)).toLowerCase(),
})) as Partial<Quotes.Quote & { _symbol: string }>[]

function onquery(query: string) {
	query = core.string.alphanumeric(query).toLowerCase()
	console.log('query ->', query)
	let results = QUOTES.map(({ _symbol, symbol, name }, i) => {

		// let sleven = core.string.levenshtein(query, symbol)
		// let srank = sleven

		let nleven = core.string.levenshtein(query, name)
		let nrank = query.length - (name.length - nleven)
		// let nrank = core.math.round(core.calc.slider(nleven, name.length, query.length))

		// let srank = query.length - (symbol.length + sleven)
		// let srank = core.calc.slider(sleven, symbol.length, query.length)
		// let ssrank = (query.length - symbol.length) + srank

		return {
			symbol: _symbol, name,
			// qlen: query.length, slen: symbol.length,
			nlength: name.length,
			nleven, //srank,
			rank: nrank, // + nrank
		}

	}).sort((a, b) => b.rank - a.rank).slice(0, 20)
	return results
}


