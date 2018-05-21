// 

import * as Vts from 'vue-property-decorator'
import Vue from 'vue'
import * as _ from '@/common/lodash'
import * as core from '@/common/core'
import * as pretty from '@/common/pretty'
import * as rkeys from '@/common/rkeys'
import * as robinhood from '@/client/adapters/robinhood'
import * as security from '@/client/adapters/security'
import * as http from '@/client/adapters/http'
import * as utils from '@/client/adapters/utils'
import store from '@/client/store'
import socket from '@/client/adapters/socket'



@Vts.Component({
	beforeRouteEnter(to, from, next) {
		// if (process.env.DEVELOPMENT) return next();
		store.state.security.rhusername ? next() : next({ name: 'login' })
	},
})
export default class extends Vue {

	tabindex = 0
	get accounts() { return this.$store.state.rh.accounts }
	get account() { return this.$store.state.rh.accounts[this.tabindex] }

	get daccount() {
		return Object.keys(this.account).filter(key => {
			return filterkey(key, this.account[key])
		}).map(key => ({
			k: _.startCase(key),
			v: tovalue(key, this.account[key]),
		})).sort((a, b) => core.sort.alphabetically(a.k, b.k))
	}
	get dmargin() {
		return Object.keys(this.account.margin_balances).filter(key => {
			return filterkey(key, this.account.margin_balances[key])
		}).map(key => ({
			k: _.startCase(key),
			v: tovalue(key, this.account.margin_balances[key]),
		})).sort((a, b) => core.sort.alphabetically(a.k, b.k))
	}
	get dinstant() {
		return Object.keys(this.account.instant_eligibility).filter(key => {
			return filterkey(key, this.account.instant_eligibility[key])
		}).map(key => ({
			k: _.startCase(key),
			v: tovalue(key, this.account.instant_eligibility[key]),
		})).sort((a, b) => core.sort.alphabetically(a.k, b.k))
	}

	// columns = [
	// 	{ field: 'k', label: 'Key', sortable: true },
	// 	{ field: 'v', label: 'Value' },
	// ]

	// mounted() {
	// 	// robinhood.sync()
	// 	// socket.on(rkeys.RH.SYNC.ACCOUNT, this.onaccount, this)
	// 	// socket.on(rkeys.RH.SYNC.ORDERS, this.onaccount, this)
	// 	// socket.on(rkeys.RH.SYNC.PORTFOLIO, this.onaccount, this)
	// 	// socket.on(rkeys.RH.SYNC.POSITIONS, this.onaccount, this)
	// }

	// beforeDestroy() {
	// 	// socket.offListener(this.onaccount, this)
	// }

	// onaccount(account: Robinhood.Account) {
	// 	// console.log('onaccount account ->', account)
	// }

}

function filterkey(key: string, value: any) {
	if (value == null) return false;
	else if (core.string.is(value) && value.indexOf('http') == 0) return false;
	else if (core.object.is(value)) return false;
	return true
}

function tovalue(key: string, value: any) {
	if (['created_at', 'updated_at'].includes(key)) {
		value = pretty.fromNow(new Date(value).valueOf(), { verbose: true })
	}
	else if (core.number.isFinite(value)) {
		value = utils.number(value, { precision: 2 })
	}
	else if (core.boolean.is(value)) {
		value = _.startCase(value as any)
	}
	else if (core.string.is(value)) {
		if (value.includes('_')) {
			value = _.startCase(value)
		}
		else if (!Array.isArray(value.match(/[0-9]/))) {
			value = core.string.capitalize(value)
		}
	}
	return value
}


