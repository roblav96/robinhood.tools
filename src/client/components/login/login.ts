// 

import * as Vts from 'vue-property-decorator'
import Vue from 'vue'
import * as http from '@/client/services/http'



@Vts.Component({
	name: 'Login',
})
export default class Login extends Vue {

	username = '' || process.env.VUE_APP_ROBINHOOD_USERNAME
	password = '' || process.env.VUE_APP_ROBINHOOD_PASSWORD
	busy = false
	mfa = ''
	ismfa = false

	get disabled() { return !this.username || !this.password }

	mounted() {
		(this.$refs.username as HTMLElement).focus()
	}

	submit() {
		http.post('/robinhood/login').then(function(response) {
			console.log('response', response)
		}).catch(function(error) {
			console.error('submit > error', error)
		})
	}

}


