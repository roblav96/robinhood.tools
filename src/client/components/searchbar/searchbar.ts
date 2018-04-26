// 

import * as Vts from 'vue-property-decorator'
import { mixins as Mixins } from 'vue-class-component'
import Vue from 'vue'
import * as _ from '@/common/lodash'
import * as http from '@/client/adapters/http'



@Vts.Component
export default class extends Vue {

	mounted() {
		this.sync()
		// if (process.env.DEVELOPMENT) (this.$refs.searchbar_input as HTMLElement).focus();
	}

	busy = false
	query = ''
	results = []

	oninput = _.debounce(this.sync, 300)
	sync(query = this.query) {
		// if (!query) return this.results.splice(0);
		this.busy = true
		http.post('/search', { query }).then(response => {
			this.results = response
		}).catch(error => {
			console.error('sync Error ->', error)
		}).finally(() => this.busy = false)
	}

	onfocus(event: Event) {
		console.log('event ->', event)
	}
	onblur(event: Event) {
		console.log('event ->', event)
	}

	onselect(result) {
		this.$router.push({ name: 'symbol', params: { symbol: result.symbol } })
	}

	onerror(event: Event) {
		let el = event.target as HTMLImageElement
		el.src = 'https://logo.clearbit.com/www.nasdaq.com'
	}

}


