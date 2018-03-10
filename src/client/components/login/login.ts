// 

import * as Vts from 'vue-property-decorator'
import Vue from 'vue'
import Grecaptcha from '@/client/components/grecaptcha/grecaptcha'
import * as http from '@/client/services/http'



@Vts.Component({
	name: 'Login',
	components: {
		'v-grecaptcha': Grecaptcha,
	},
})
export default class Login extends Vue {

	username = '' || process.env.VUE_APP_ROBINHOOD_USERNAME
	password = '' || process.env.VUE_APP_ROBINHOOD_PASSWORD
	human = false
	busy = false
	mfa = ''
	ismfa = false

	mounted() {
		document.getElementById('username_input').focus()
	}

	gresponse(response: boolean) { this.human = response }
	get disabled() { return !(this.username && this.password && this.human) }
	@Vts.Watch('disabled') w_disabled(disabled: boolean) {
		console.log('disabled', disabled)
	}

	submit() {
		console.warn('submit')
		if (this.disabled || this.busy) return;
		this.busy = true
		http.post('/robinhood/login', {
			username: this.username,
			password: this.password,
		}).then(response => {
			console.log('response', response)
			setTimeout(() => this.busy = false, 1000)
		}).catch(error => {
			console.error('submit > error', error)
		})
	}

}









