//

import * as Vts from 'vue-property-decorator'
import Vue from 'vue'
import * as _ from '../../../common/lodash'
import * as http from '../../../common/http'
import * as robinhood from '../../adapters/robinhood'
import * as alerts from '../../adapters/alerts'
import store from '../../store'
import socket from '../../adapters/socket'

@Vts.Component({
	components: {
		'v-grecaptcha': () => import('../../components/grecaptcha'),
	},
	beforeRouteEnter(to, from, next) {
		if (!store.state.security.rhusername) return next()
		next({ name: 'robinhood' })
	},
})
export default class extends Vue {
	mounted() {
		this.username_input.focus()
		setImmediate(() => document.documentElement.scrollTo({ top: 0, behavior: 'instant' }))
	}

	get username_input() {
		return this.$refs.username_input as HTMLInputElement
	}
	get mfa_input() {
		return this.$refs.mfa_input as HTMLInputElement
	}
	get ishuman() {
		return this.$store.state.security.ishuman
	}
	get ready() {
		return this.username && this.password && this.ishuman
	}

	username = '' || process.env.ROBINHOOD_USERNAME
	password = '' || process.env.ROBINHOOD_PASSWORD
	mfa = ''
	ismfa = false
	busy = false

	submit() {
		if (!this.ready || this.busy) return
		this.busy = true
		return http
			.post('/robinhood/login', {
				username: this.username,
				password: this.password,
				mfa: this.mfa,
			})
			.then((response: Security.Doc & { mfa: boolean }) => {
				if (response.mfa) {
					this.ismfa = true
					this.$nextTick(() => this.mfa_input.focus())
					return
				}

				Object.assign(this.$store.state.security, response)
				alerts.toast(`Robinhood login success! Hello ${response.rhusername}`)
				this.$router.push({ name: 'robinhood' })
				return socket.discover()
			})
			.catch((error) => {
				console.error('submit Error ->', error)
			})
			.finally(() => (this.busy = false))
	}
}
