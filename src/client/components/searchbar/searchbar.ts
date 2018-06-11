// 

import * as Vts from 'vue-property-decorator'
import { mixins as Mixins } from 'vue-class-component'
import Vue from 'vue'
import VMixin from '../../mixins/v.mixin'
import * as _ from '../../../common/lodash'
import * as rkeys from '../../../common/rkeys'
import * as http from '../../../common/http'
import * as utils from '../../adapters/utils'
import * as recents from '../../stores/recents'



@Vts.Component
export default class extends Mixins(VMixin) {

	mounted() {
		utils.wemitter.on('keyup', this.onkeyup, this)
	}
	beforeDestroy() {
		utils.wemitter.off('keyup', this.onkeyup, this)
	}
	onkeyup(event: KeyboardEvent) {
		if (event.metaKey || event.shiftKey || event.ctrlKey || event.altKey) return;
		if (['Escape'].includes(event.key)) {
			if (document.activeElement.outerHTML != this.inputfield.outerHTML) return;
			this.inputfield.blur()
		}
		if (['f', 'l', 't', '/'].includes(event.key)) {
			if (document.activeElement.tagName == 'INPUT') return;
			this.searchbar.$el.querySelector('input').focus()
		}
	}

	get searchbar() { return this.$refs.searchbar_input as Vue }
	get inputfield() { return this.searchbar.$el.querySelector('input') }
	scrolltop(behavior = 'smooth' as ScrollBehavior) {
		let el = this.searchbar.$el.querySelector('div.dropdown-menu > div.dropdown-content') as HTMLElement
		el.scrollTo({ top: 0, behavior })
	}

	query = ''
	results = [] as Quotes.Quote[]

	oninput = _.debounce(this.sync, 100, { leading: false, trailing: true })
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
		this.inputfield.blur()
	}

}


