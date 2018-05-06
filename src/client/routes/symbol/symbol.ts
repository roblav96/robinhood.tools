// 

import * as Vts from 'vue-property-decorator'
import { mixins as Mixins } from 'vue-class-component'
import Vue from 'vue'
import * as rkeys from '@/common/rkeys'
import socket from '@/client/adapters/socket'



@Vts.Component
export default class extends Vue {

	get symbol() { return this.$route.params.symbol }

	mounted() {
		console.log('this.$route ->', this.$route)
		socket.on(`${rkeys.WB.QUOTES}:${this.symbol}`, this.onquote, this)
	}

	beforeDestroy() {
		socket.offListener(this.onquote, this)
	}

	onquote(quote: Webull.Quote) {
		console.log('quote ->', quote)
	}

}


