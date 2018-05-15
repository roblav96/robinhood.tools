// 

export * from '@/common/robinhood'
import * as robinhood from '@/common/robinhood'
import * as _ from '@/common/lodash'
import * as core from '@/common/core'
import lockr from 'lockr'
import store from '@/client/store'
import * as http from '@/client/adapters/http'



const state = {
	account: lockr.get('rh.account', {} as Robinhood.Account),
	application: lockr.get('rh.application', {} as Robinhood.Application),
	portfolio: lockr.get('rh.portfolio', {} as Robinhood.Portfolio),
	user: lockr.get('rh.user', {} as Robinhood.User),
}
store.registerModule('rh', { state })
declare global { namespace Store { interface State { rh: typeof state } } }



export function sync() {
	return Promise.resolve().then(function() {
		return http.get('/robinhood/sync')

	}).then(function(response) {
		console.log('response ->', response)

	}).catch(function(error) {
		console.error('sync Error ->', error)
	})
}


