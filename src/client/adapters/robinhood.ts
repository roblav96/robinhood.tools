// 

export * from '@/common/robinhood'
import * as _ from '@/common/lodash'
import * as core from '@/common/core'
import * as rkeys from '@/common/rkeys'
import * as robinhood from '@/common/robinhood'
import * as security from '@/client/adapters/security'
import * as http from '@/client/adapters/http'
import * as lockr from 'lockr'
import socket from '@/client/adapters/socket'
import store from '@/client/store'
import clock from '@/common/clock'



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
Object.keys(state).forEach(k => state[k] = lockr.get(`rh.${k}`, state[k]))
store.register('rh', state)
declare global { namespace Store { interface State { rh: Robinhood.State } } }
declare global { namespace Robinhood { type State = typeof state } }



export function sync(body: {
	synckeys?: KeysOf<Robinhood.State>
	all?: boolean
} = {}) {
	return http.post('/robinhood/sync', body).catch(function(error) {
		console.error('robinhood sync Error ->', error)
		return {}
	}) as Promise<Robinhood.State>
}



store.watch(state => state.security.rhusername, rhusername => {
	if (!rhusername) return;
	console.time(`sync`)
	sync().then(onsync).then(function(response) {
		console.timeEnd(`sync`)
		console.log('robinhood sync response ->', JSON.parse(JSON.stringify(response)))
		Object.keys(response).forEach(function(key) {
			lockr.set(`rh.${key}`, response[key])
		})
	})
})

let L_KEYS = ['accounts', 'orders', 'portfolios', 'positions'] as KeysOf<Robinhood.State>
L_KEYS.forEach(function(key) {
	socket.on(`${rkeys.RH.SYNC}:${key}`, onsync)
})



const P_KEYS = (({
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

export function onsync(response: Robinhood.State) {
	Object.keys(response).forEach(function(key) {
		state[key] = response[key]
		// let target = state[key]
		// let source = response[key]
		// if (core.object.is(source)) {
		// 	core.object.assign(target, source, true)
		// } else if (Array.isArray(source)) {
		// 	core.array.merge(target, source, P_KEYS[key], true)
		// } else {
		// 	state[key] = source
		// }
	})
	return response
	// return _.mapValues(response, (v, k) => state[k])
}





// pForever(function onsync() {
// 	return core.promise.delay(3000).then(function() {
// 		if (!didsync || !store.state.security.rhusername) return;
// 		return sync({ synckeys: SYNCS }).then(function(response) {
// 			Object.keys(response).forEach(function(key) {
// 				let value = response[key]
// 				state[key] = value
// 				lockr.set(`rh.${key}`, value)
// 			})
// 		})
// 	})
// })

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


