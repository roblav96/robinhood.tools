// 

import lockr from 'lockr'
import store from '../store'
import socket from '../adapters/socket'
import * as _ from '../../common/lodash'
import * as http from '../../common/http'
import * as rkeys from '../../common/rkeys'



let state = {
	hours: null as Hours,
	state: null as Hours.State,
}
Object.assign(state, lockr.get('hours', state))
store.register('hours', state)
declare global { namespace Store { interface State { hours: typeof state } } }

_.defer(function() {

	store.watch(function(state) { return state.security.ready }, function(ready) {
		http.get('/hours', { retries: Infinity }).then(function(response: typeof state) {
			Object.assign(state, response)
		}).catch(error => console.error('watch security.ready Error ->', error))
	})

	store.watch(function(state) { return state.hours }, function(state) {
		lockr.set('hours', state)
	}, { deep: true })

	socket.on(rkeys.HR.HOURS, v => Object.assign(state.hours, v))
	socket.on(rkeys.HR.STATE, v => state.state = v)

})


