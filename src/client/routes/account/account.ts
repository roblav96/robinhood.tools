// 

import * as Vts from 'vue-property-decorator'
import Vue from 'vue'
import * as _ from '@/common/lodash'
import * as core from '@/common/core'
import * as rkeys from '@/common/rkeys'
import * as robinhood from '@/common/robinhood'
import * as security from '@/client/adapters/security'
import * as http from '@/client/adapters/http'
import socket from '@/client/adapters/socket'



@Vts.Component
export default class extends Vue {

	mounted() {
		socket.on(`${rkeys.RH.WS.ACCOUNT}:${security.doc.uuid}`, this.onaccount, this)
	}

	beforeDestroy() {
		socket.offListener(this.onaccount, this)
	}

	onaccount(account: Robinhood.Account) {
		console.log('onaccount account ->', account)
	}

}


