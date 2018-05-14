// 

import * as Vts from 'vue-property-decorator'
import Vue from 'vue'
import * as http from '@/client/adapters/http'



@Vts.Component({
	components: {
		'v-grecaptcha': () => import('@/client/components/grecaptcha'),
	},
})
export default class extends Vue {

	mounted() {
		this.username_input.focus()
	}

	get username_input() { return this.$refs.username_input as HTMLInputElement }
	get mfa_input() { return this.$refs.mfa_input as HTMLInputElement }
	get ishuman() { return this.$store.state.security.ishuman }
	get ready() { return this.username && this.password && this.ishuman }

	username = '' || process.env.ROBINHOOD_USERNAME
	password = '' || process.env.ROBINHOOD_PASSWORD
	mfa = ''
	ismfa = false
	busy = false

	submit() {
		if (!this.ready || this.busy) return;
		this.busy = true
		http.post('/robinhood/login', {
			username: this.username, password: this.password,
		}).then(response => {
			console.log('response', response)
		}).catch(error => {
			console.error('submit Error ->', error)
		}).finally(() => this.busy = false)
	}

}


