// 

export * from '@/common/robinhood'
import * as _ from '@/common/lodash'
import * as core from '@/common/core'
import * as robinhood from '@/common/robinhood'
import * as security from '@/client/adapters/security'
import * as http from '@/client/adapters/http'
import store from '@/client/store'
import lockr from 'lockr'



const state = {
	accounts: [] as Robinhood.Account[],
	applications: [] as Robinhood.Application[],
	orders: [] as Robinhood.Order[],
	portfolios: [] as Robinhood.Portfolio[],
	positions: [] as Robinhood.Position[],
	subscriptions: [] as Robinhood.Subscription[],
	user: {} as Robinhood.User,
	watchlist: [] as Robinhood.Watchlist[],
}
Object.keys(state).forEach(k => state[k] = lockr.get(`rh.${k}`, state[k]))
store.register('rh', state)
declare global {
	namespace Store { interface State { rh: typeof state } }
	namespace Robinhood { type State = typeof state }
}



store.watch(state => state.security.rhusername, rhusername => {
	if (!rhusername) return;
	sync({ synckeys: ['applications', 'accounts'] })
	// sync({ positions: { all: true } })
	// let synckeys = Object.keys(state).filter(k => _.isEmpty(state[k])) as KeysOf<Robinhood.State>
	// if (_.isEmpty(synckeys)) return;
	// sync({ synckeys, positions: { all: true } })
})

export function sync(body: {
	synckeys?: KeysOf<Robinhood.State>,
	positions?: { all: boolean },
	orders?: { all: boolean },
} = {}) {
	// _.defaults(body, {
	// 	synckeys: Object.keys(state),
	// 	positions: { all: false },
	// 	orders: { all: false },
	// } as typeof body)
	console.log('body ->', body)
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


