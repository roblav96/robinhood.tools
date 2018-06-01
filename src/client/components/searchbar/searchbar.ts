// 

import * as Vts from 'vue-property-decorator'
import { mixins as Mixins } from 'vue-class-component'
import Vue from 'vue'
import VMixin from '@/client/mixins/v.mixin'
import * as _ from '@/common/lodash'
import * as rkeys from '@/common/rkeys'
import * as http from '@/client/adapters/http'
import * as recents from '@/client/stores/recents'



@Vts.Component
export default class extends Mixins(VMixin) {

	get searchbar() { return this.$refs.searchbar_input as Vue }

	busy = false
	query = ''
	results = [] as Quotes.Quote[]

	oninput = _.debounce(this.syncquery, 300)
	syncquery() {
		if (!this.query) return this.syncrecents();
		this.busy = true
		return http.get('/search', {
			query: { query: this.query },
		}).then(results => {
			this.results = results
		}).catch(error => {
			console.error('syncquery Error ->', error)
		}).finally(() => this.busy = false)
	}

	syncrecents() {
		this.busy = true
		return http.post('/recents', {
			symbols: this.recents.map(v => v.symbol),
		}).then(results => {
			this.results = results
		}).catch(error => {
			console.error('syncrecents Error ->', error)
		}).finally(() => this.busy = false)
	}

	onfocus(event: Event) {
		let el = event.target as HTMLInputElement
		el.setSelectionRange(0, el.value.length)
		this.syncquery()
	}
	onblur(event: Event) {

	}

	onselect(result: Quotes.Quote) {
		let name = this.$route.name.includes('symbol.') ? this.$route.name : 'symbol'
		this.$router.push({ name, params: { symbol: result.symbol } })
		setTimeout(() => {
			this.searchbar.$el.querySelector('input').blur()
			this.results.splice(0)
		}, 100)
	}

}


