// 

import * as Vts from 'vue-property-decorator'
import Vue from 'vue'
import * as _ from '@/common/lodash'
import * as core from '@/common/core'
import * as rkeys from '@/common/rkeys'
import * as robinhood from '@/common/robinhood'
import * as security from '@/client/adapters/security'
import * as http from '@/client/adapters/http'
import store from '@/client/store'
import socket from '@/client/adapters/socket'



@Vts.Component({
	beforeRouteEnter(to, from, next) {
		// if (process.env.DEVELOPMENT) return next();
		_.get(store, 'state.security.rhusername') ? next() : next({ name: 'login' })
	},
})
export default class extends Vue {

	mounted() {
		socket.on(rkeys.RH.SYNC.ACCOUNT, this.onaccount, this)
		console.log('this.$store.state.rh ->', JSON.parse(JSON.stringify(this.$store.state.rh)))
	}

	beforeDestroy() {
		socket.offListener(this.onaccount, this)
	}

	onaccount(account: Robinhood.Account) {
		console.log('onaccount account ->', account)
	}

}


