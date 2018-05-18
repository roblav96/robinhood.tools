// 

export * from '@/common/robinhood'
import * as _ from '@/common/lodash'
import * as core from '@/common/core'
import * as robinhood from '@/common/robinhood'
import * as security from '@/client/adapters/security'
import * as http from '@/client/adapters/http'
import * as lockr from 'lockr'
import * as pForever from 'p-forever'
import socket from '@/client/adapters/socket'
import store from '@/client/store'
import clock from '@/common/clock'



const LIVES = ['accounts', 'orders', 'portfolios', 'positions'] as KeysOf<Robinhood.State>

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



export function sync(body: {
	synckeys?: KeysOf<Robinhood.State>
	all?: boolean
} = {}) {
	return http.post('/robinhood/sync', body).catch(function(error) {
		console.error('sync Error ->', error)
		return {}
	}) as Promise<Robinhood.State>
}



pForever(function onsync() {
	return core.promise.delay(1000).then(function() {
		if (!store.state.security.rhusername) return;
		return sync({ synckeys: LIVES }).then(function(response) {
			Object.keys(response).forEach(k => state[k] = response[k])
		})
	})
})





// const primaries = (({
// 	accounts: 'account_number' as any,
// 	achrelationships: 'id' as any,
// 	achtransfers: 'id' as any,
// 	applications: 'url' as any,
// 	orders: 'id' as any,
// 	portfolios: 'account' as any,
// 	positions: 'url' as any,
// 	subscriptions: 'id' as any,
// 	watchlists: 'url' as any,
// } as typeof state) as any) as Dict<string>

// let didsync = false
// store.watch(state => state.security.rhusername, rhusername => {
// 	if (!rhusername) return;
// 	let keys = lockr.keys()
// 	let all = Object.keys(state).filter(k => !keys.includes(`rh.${k}`)).length > 0
// 	sync({ all }).then(function(response) {
// 		Object.keys(response).forEach(function(key) {
// 			let target = lockr.get(`rh.${key}`, Array.isArray(state[key]) ? [] : {})
// 			let source = response[key]
// 			if (core.object.is(target) && core.object.is(source)) {
// 				core.object.assign(target, source, true)
// 			} else if (Array.isArray(target) && Array.isArray(source)) {
// 				core.array.merge(target, source, primaries[key], true)
// 			} else {
// 				target = source
// 			}
// 			lockr.set(`rh.${key}`, target)
// 			if (LIVES.includes(key as any)) {
// 				state[key] = target
// 			}
// 		})
// 		didsync = true
// 	})
// 	console.log('state ->', state)
// })


