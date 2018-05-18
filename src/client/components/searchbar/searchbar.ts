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
	results = [] as Robinhood.Instrument[]

	oninput = _.debounce(this.sync, 300)
	sync() {
		if (!this.query) return this.recents();
		this.busy = true
		return http.get('/search', {
			query: { query: this.query },
		}).then((response: Robinhood.Instrument[]) => {
			this.results = response
		}).catch(error => {
			console.error('sync Error ->', error)
		}).finally(() => this.busy = false)
	}

	recents() {
		this.busy = true
		return http.post('/recents', {
			symbols: this.$store.state.recents.map(v => v.symbol),
		}).then((response: Robinhood.Instrument[]) => {
			this.results = response
		}).catch(error => {
			console.error('recents Error ->', error)
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
			this.results.splice(0)
		}, 100)
	}

}


