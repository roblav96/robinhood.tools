// 

import * as Vts from 'vue-property-decorator'
import { mixins as Mixins } from 'vue-class-component'
import Vue from 'vue'
import * as _ from '@/common/lodash'
import * as core from '@/common/core'
import * as http from '@/client/adapters/http'
import * as security from '@/client/services/security'



@Vts.Component
export default class extends Vue {

	mounted() {
		
	}

	busy = false
	query = ''
	results = []

	oninput = _.debounce(this.sync, 300)
	sync(query: string) {
		if (!query) return this.results.splice(0);
		this.busy = true
		http.post('/search', { query }).then(response => {
			this.results = response
		}).catch(error => {
			console.error('sync Error ->', error)
		}).finally(() => this.busy = false)
	}

	onselect(result) {
		console.log('result ->', JSON.stringify(result, null, 4))
	}



}


