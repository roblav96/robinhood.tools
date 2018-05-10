// 

import * as Vts from 'vue-property-decorator'
import { mixins as Mixins } from 'vue-class-component'
import Vue from 'vue'
import * as _ from '@/common/lodash'
import * as rkeys from '@/common/rkeys'
import * as http from '@/client/adapters/http'
import * as recents from '@/client/stores/recents'



@Vts.Component
export default class extends Vue {

	mounted() {

	}

	get searchbar() { return this.$refs.searchbar_input as Vue }

	busy = false
	query = ''
	results = [] as Robinhood.Instrument[]

	oninput = _.debounce(this.sync, 300)
	sync() {
		if (!this.query) return this.syncRecents();
		this.busy = true
		http.get('/search', {
			query: { query: this.query },
		}).then(response => {
			this.results = response
		}).catch(error => {
			console.error('sync Error ->', error)
		}).finally(() => this.busy = false)
	}

	syncRecents() {
		this.busy = true
		let symbols = this.$store.state.recents.map(v => v.symbol)
		http.post('/symbols', {
			symbols, wants: ['instruments'],
		} as Api.SymbolsBody).then((response: Api.SymbolsResponse) => {
			console.log('response ->', response)
			this.results = response.instruments
		}).catch(error => {
			console.error('syncRecents Error ->', error)
		}).finally(() => this.busy = false)
	}

	onfocus(event: Event) {
		let el = event.target as HTMLInputElement
		el.setSelectionRange(0, el.value.length)
		this.sync()
	}
	onblur(event: Event) {

	}

	onselect(result: Robinhood.Instrument) {
		this.$router.push({ name: 'symbol', params: { symbol: result.symbol } })
		setTimeout(() => {
			this.searchbar.$el.querySelector('input').blur()
			// this.searchbar.$el.blur()
			this.results.splice(0)
		}, 100)
	}

}


