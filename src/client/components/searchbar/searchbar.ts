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
	scrolltop(behavior = 'smooth' as ScrollBehavior) {
		let el = this.searchbar.$el.querySelector('div.dropdown-menu > div.dropdown-content') as HTMLElement
		el.scrollTo({ top: 0, behavior })
	}

	query = ''
	results = [] as Quotes.Quote[]

	oninput = _.debounce(this.sync, 100)
	sync() {
		return Promise.resolve().then(() => {
			if (!this.query) return http.post('/recents', { symbols: this.recents.map(v => v.symbol) });
			return http.get('/search', { query: { query: this.query } })
		}).then(results => {
			this.results = results
			return this.$nextTick()
		}).catch(error => {
			console.error('sync Error ->', error)
		}).finally(() => {
			this.scrolltop()
		})
	}

	onfocus(event: Event) {
		this.$nextTick(() => this.scrolltop('instant'))
		let el = event.target as HTMLInputElement
		el.setSelectionRange(0, el.value.length)
		this.sync()
	}
	onblur(event: Event) {

	}

	onselect(result: Quotes.Quote) {
		let name = this.$route.name.includes('symbol.') ? this.$route.name : 'symbol'
		this.$router.push({ name, params: { symbol: result.symbol } })
		this.searchbar.$el.querySelector('input').blur()
	}

}


