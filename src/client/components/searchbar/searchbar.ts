// 

import * as Vts from 'vue-property-decorator'
import { mixins as Mixins } from 'vue-class-component'
import Vue from 'vue'
import _ from 'lodash'
import * as core from '@/common/core'
import * as http from '@/client/adapters/http'
import * as security from '@/client/services/security'



@Vts.Component
export default class extends Vue {

	mounted() {
		// if (DEVELOPMENT) setTimeout(() => this.query = 'nvda', 300);
		// security.EE4.once('ready', function() {
		// 	http.get('https://infoapi.webull.com/api/search/tickers2', {
		// 		query: { keys: 'nvda' },
		// 		iscors: true,
		// 	}).then(function(response) {
		// 		console.log('response ->', response)
		// 	}).catch(function(error) {
		// 		console.error('mounted Error ->', error)
		// 	})
		// })
	}

	busy = false
	query = ''
	results = []

	oninput = _.debounce(this.sync, 300)
	sync(query: string) {
		if (!query) return this.results.splice(0);
		this.busy = true
		http.post('/search', { query }).then(response => {
			console.log('response ->', core.json.clone(response))
			this.results = response.list

		}).catch(error => {
			console.error('sync Error ->', error)
		}).finally(() => this.busy = false)
	}

	onselect(result) {
		console.log('result ->', JSON.stringify(result, null, 4))
	}



}


