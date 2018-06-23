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


