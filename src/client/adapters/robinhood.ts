// 

export * from '@/common/robinhood'
import * as _ from '@/common/lodash'
import * as core from '@/common/core'
import * as robinhood from '@/common/robinhood'
import * as security from '@/client/adapters/security'
import * as http from '@/client/adapters/http'
import * as lockr from 'lockr'
import store from '@/client/store'



const state = {
	accounts: [] as Robinhood.Account[],
	achtransfers: [] as Robinhood.AchTransfer[],
	achrelationships: [] as Robinhood.AchRelationship[],
	applications: [] as Robinhood.Application[],
	orders: [] as Robinhood.Order[],
	portfolios: [] as Robinhood.Portfolio[],
	positions: [] as Robinhood.Position[],
	subscriptions: [] as Robinhood.Subscription[],
	user: {} as Robinhood.User,
	watchlists: [] as Robinhood.Watchlist[],
}
// Object.keys(state).forEach(k => state[k] = lockr.get(`rh.${k}`, state[k]))
store.register('rh', state)
declare global {
	namespace Store { interface State { rh: typeof state } }
	namespace Robinhood { type State = typeof state }
}



store.watch(state => state.security.rhusername, rhusername => {
	if (!rhusername) return;
	let exists = lockr.keys()
	let synckeys = Object.keys(state).filter(k => !exists.includes(`rh.${k}`)) as KeysOf<Robinhood.State>
	sync({ synckeys: _.uniq(synckeys.concat('accounts', 'applications', 'portfolios', 'user')), all: true })
	// sync({ synckeys: ['achrelationships'], all: true })
})

export function sync(body: {
	synckeys?: KeysOf<Robinhood.State>
	all?: boolean
} = {}) {
	return Promise.resolve().then(function() {
		return http.post('/robinhood/sync', body)
	}).then(function(response: Robinhood.State) {
		console.log('response ->', JSON.parse(JSON.stringify(response)))
		Object.keys(response).forEach(key => {
			let value = response[key]
			lockr.set(`rh.${key}`, value)
			state[key] = value
		})
	}).catch(error => console.error('sync Error ->', error))
}


