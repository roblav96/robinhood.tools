// 

import * as Vts from 'vue-property-decorator'
import Vue from 'vue'
import * as _ from '@/common/lodash'
import * as core from '@/common/core'
import * as rkeys from '@/common/rkeys'
import * as robinhood from '@/client/adapters/robinhood'
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
		robinhood.sync()
		// socket.on(rkeys.RH.SYNC.ACCOUNT, this.onaccount, this)
		// socket.on(rkeys.RH.SYNC.ORDERS, this.onaccount, this)
		// socket.on(rkeys.RH.SYNC.PORTFOLIO, this.onaccount, this)
		// socket.on(rkeys.RH.SYNC.POSITIONS, this.onaccount, this)
	}

	beforeDestroy() {
		// socket.offListener(this.onaccount, this)
	}

	onaccount(account: Robinhood.Account) {
		// console.log('onaccount account ->', account)
	}

}


