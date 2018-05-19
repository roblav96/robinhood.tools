// 

import * as Vts from 'vue-property-decorator'
import Vue from 'vue'
import * as _ from '@/common/lodash'
import * as robinhood from '@/client/adapters/robinhood'
import * as http from '@/client/adapters/http'
import store from '@/client/store'
import socket from '@/client/adapters/socket'



@Vts.Component({
	components: {
		'v-grecaptcha': () => import('@/client/components/grecaptcha'),
	},
	beforeRouteEnter(to, from, next) {
		// if (process.env.DEVELOPMENT) return next();
		store.state.security.rhusername ? next({ name: 'robinhood' }) : next()
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
		return http.post('/robinhood/login', {
			username: this.username,
			password: this.password,
			mfa: this.mfa,
		}).then((response: Security.Doc & { mfa: boolean }) => {
			if (response.mfa) {
				this.ismfa = true
				this.$nextTick(() => this.mfa_input.focus())
				return
			}

			Object.assign(this.$store.state.security, response)
			return Promise.all([
				socket.discover(),
				socket.toPromise('ready'),
			]).then(() => {
				this.$toast.open(`Robinhood login success! Hello ${response.rhusername}...`)
				this.$router.push({ name: 'robinhood' })
			})

		}).catch(error => {
			console.error('submit Error ->', error)
		}).finally(() => this.busy = false)
	}

}


