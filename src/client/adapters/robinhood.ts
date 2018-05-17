// 

export * from '@/common/robinhood'
import * as _ from '@/common/lodash'
import * as core from '@/common/core'
import * as robinhood from '@/common/robinhood'
import * as http from '@/client/adapters/http'
import store from '@/client/store'
import lockr from 'lockr'



const state = {
	account: lockr.get('rh.account', {} as Robinhood.Account),
	application: lockr.get('rh.application', {} as Robinhood.Application),
	orders: lockr.get('rh.orders', [] as Robinhood.Order[]),
	portfolio: lockr.get('rh.portfolio', {} as Robinhood.Portfolio),
	positions: lockr.get('rh.positions', [] as Robinhood.Position[]),
	subscriptions: lockr.get('rh.subscriptions', [] as Robinhood.Subscription[]),
	user: lockr.get('rh.user', {} as Robinhood.User),
	watchlist: lockr.get('rh.watchlist', [] as Robinhood.Watchlist[]),
}
store.register('rh', state)
declare global {
	namespace Store { interface State { rh: typeof state } }
	namespace Robinhood { type State = typeof state }
}



store.watch(state => state.security.rhusername, rhusername => {
	if (!rhusername) return;
	let synckeys = Object.keys(state).filter(k => _.isEmpty(state[k]))
	if (_.isEmpty(synckeys)) return;
	sync(synckeys as any)
})

export function sync(synckeys?: KeysOf<Robinhood.State>) {
	return Promise.resolve().then(function() {
		return http.post('/robinhood/sync', {
			synckeys,
			positions: { nonzero: false },
			// synckeys: ['positions'] as KeysOf<Robinhood.State>,
		})
	}).then(function(response: Robinhood.State) {
		// console.log('response ->', JSON.parse(JSON.stringify(response)))
		Object.keys(response).forEach(key => {
			let value = response[key]
			lockr.set(`rh.${key}`, value)
			state[key] = value
		})
	}).catch(error => console.error('sync Error ->', error))
}


