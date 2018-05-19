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
declare global { namespace Robinhood { type State = typeof state } }

store.register('rh', state)
declare global { namespace Store { interface State { rh: Robinhood.State } } }

// function equity(store: Robinhood.State, getters: Store.Getters) {
// 	let value = _.sum(store.portfolios.map(v => v.extended_hours_equity || v.equity))
// 	let previous = _.sum(store.portfolios.map(v => v.adjusted_equity_previous_close || v.equity_previous_close))
// 	return { value, previous, change: value - previous, percent: core.calc.percent(value, previous) }
// }
// declare global { namespace Store { interface Getters { equity: ReturnType<typeof equity> } } }

// function market(store: Robinhood.State, getters: Store.Getters) {
// 	return _.sum(store.portfolios.map(v => v.extended_hours_market_value || v.market_value))
// }
// declare global { namespace Store { interface Getters { market: ReturnType<typeof market> } } }

// store.register('rh', state, { equity, market })
// declare global { namespace Store { interface State { rh: Robinhood.State } } }



export function sync(body: {
	synckeys?: KeysOf<Robinhood.State>
	all?: boolean
} = {}) {
	return http.post('/robinhood/sync', body).catch(function(error) {
		console.error('sync Error ->', JSON.stringify(error, null, 4))
		return {}
	}) as Promise<Robinhood.State>
}



store.watch(state => state.security.rhusername, rhusername => {
	if (!rhusername) return;
	sync().then(function(response) {
		console.log('robinhood sync response ->', JSON.parse(JSON.stringify(response)))
		Object.keys(response).forEach(function(key) {
			let value = response[key]
			lockr.set(`rh.${key}`, value)
			state[key] = value
		})
	})
})



function onsync(data: Robinhood.State) {
	Object.keys(data).forEach(k => state[k] = data[k])
}
(['accounts', 'orders', 'portfolios', 'positions'] as KeysOf<Robinhood.State>).forEach(function(key) {
	socket.on(`${rkeys.RH.SYNC}:${key}`, onsync)
})

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


