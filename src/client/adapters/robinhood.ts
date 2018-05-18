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



store.watch(state => state.security.rhusername, rhusername => {
	if (!rhusername) return;
	let exists = lockr.keys()
	let synckeys = Object.keys(state).filter(k => !exists.includes(`rh.${k}`)) as KeysOf<Robinhood.State>
	sync({ synckeys: _.uniq(synckeys.concat('accounts', 'applications', 'portfolios', 'user')), all: true })
	// sync({ all: true })
})

export function sync(body: {
	synckeys?: KeysOf<Robinhood.State>
	all?: boolean
} = {}) {
	return Promise.resolve().then(function() {
		return http.post('/robinhood/sync', body)
	}).then(function(response: Robinhood.State) {
		console.log('robinhood sync response ->', JSON.parse(JSON.stringify(response)))
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
			lockr.set(`rh.${key}`, state[key])
			// console.log('state[' + key + '] ->', JSON.stringify(state[key], null, 4))
		})
		// console.log('state ->', JSON.stringify(state, null, 4))
	}).catch(error => console.error('sync Error ->', error))
}


