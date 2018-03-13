// 

import * as Vts from 'vue-property-decorator'
import { mixins as Mixins } from 'vue-class-component'
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

	mounted() {
		document.getElementById('username_input').focus()
	}

	username = '' || process.env.ROBINHOOD_USERNAME
	password = '' || process.env.ROBINHOOD_PASSWORD
	busy = false
	mfa = ''
	ismfa = false

	human = false
	gresponse(response: boolean) { this.human = response }

	get disabled() { return !(this.username && this.password && this.human) }
	// @Vts.Watch('disabled') w_disabled(disabled: boolean) {
	// 	console.log('disabled', disabled)
	// }

	submit() {
		console.warn('submit')
		if (this.disabled || this.busy) return;
		this.busy = true
		http.post('/robinhood/login', {
			username: this.username,
			password: this.password,
		}).then(response => {
			console.log('response', response)
			// setTimeout(() => this.busy = false, 3000)
		}).catch(error => {
			console.error('submit > error', error)
		}).finally(() => {
			this.busy = false
		})
	}

}



@Vts.Component
export class Mixin extends Vue {
	showLogin() { show(this) }
}

export function show(vm: Vue) {
	vm.$root.$modal.open({
		parent: vm.$root,
		component: Login,
		hasModalCard: true
	})
}









