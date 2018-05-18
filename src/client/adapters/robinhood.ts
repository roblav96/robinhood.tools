// 

export * from '@/common/robinhood'
import * as _ from '@/common/lodash'
import * as core from '@/common/core'
import * as robinhood from '@/common/robinhood'
import * as security from '@/client/adapters/security'
import * as http from '@/client/adapters/http'
import * as lockr from 'lockr'
import * as pForever from 'p-forever'
import clock from '@/common/clock'
import store from '@/client/store'



const state = {
	accounts: [] as Robinhood.Account[],
	achrelationships: [] as Robinhood.AchRelationship[],
	achtransfers: [] as Robinhood.AchTransfer[],
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



const primaries = (({
	accounts: 'account_number' as any,
	achrelationships: 'id' as any,
	achtransfers: 'id' as any,
	applications: 'url' as any,
	orders: 'id' as any,
	portfolios: 'account' as any,
	positions: 'url' as any,
	subscriptions: 'id' as any,
	watchlists: 'url' as any,
} as typeof state) as any) as Dict<string>



// store.watch(state => state.security.rhusername, rhusername => {
// 	if (!rhusername) return;
// 	let all = !_.isEmpty(Object.keys(state).filter(k => _.isEmpty(state[k])))
// 	sync({ all })
// 	// let synckeys = Object.keys(state) as KeysOf<Robinhood.State>
// 	// if (!all) synckeys.remove(k => (['achrelationships'] as KeysOf<Robinhood.State>).includes(k));
// 	// sync({ synckeys, all })
// 	// sync({ synckeys: _.uniq(synckeys.concat('accounts', 'applications', 'portfolios', 'user')), all })
// })

// let didsync = false
export function sync(body: {
	synckeys?: KeysOf<Robinhood.State>
	all?: boolean
} = {}) {
	return Promise.resolve().then(function() {
		return http.post('/robinhood/sync', body)
	}).then(function(response: Robinhood.State) {
		// console.log('robinhood sync response ->', JSON.parse(JSON.stringify(response)))
		Object.keys(response).forEach(key => {
			let target = state[key]
			let source = response[key]
			if (core.object.is(target) && core.object.is(source)) {
				core.object.assign(target, source, true)
			} else if (Array.isArray(target) && Array.isArray(source)) {
				core.array.merge(target, source, primaries[key], true)
			} else {
				state[key] = source
			}
			// if (!didsync) lockr.set(`rh.${key}`, state[key]);
			// console.log('state[' + key + '] ->', JSON.stringify(state[key], null, 4))
		})
		// didsync = true
		// console.log('state ->', JSON.stringify(state, null, 4))
	}).catch(function(error) {
		console.error('sync Error ->', error)

	})
}



// pForever(function onsync() {
// 	return core.promise.delay(1000).then(function() {
// 		if (!store.state.security.rhusername) return;
// 		return sync({ synckeys: ['accounts', 'orders', 'portfolios', 'positions'] }).then(function(response) {

// 		})
// 	})
// })


