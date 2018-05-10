// 

import lockr from 'lockr'
import store from '@/client/store'
import socket from '@/client/adapters/socket'
import * as http from '@/client/adapters/http'
import * as rkeys from '@/common/rkeys'



let state = {
	hours: null as Hours,
	state: null as Hours.State,
}
Object.assign(state, lockr.get('hours', state))
store.registerModule('hours', { state })
declare global { namespace Store { interface State { hours: typeof state } } }

setImmediate(function() {
	store.watch(function(state) { return state.security.ready }, function(ready) {
		http.get('/hours', { retries: Infinity }).then(function(response: typeof state) {
			Object.assign(state, response)
		}).catch(error => console.error('watch security.ready Error ->', error))
	})
	store.watch(function(state) { return state.hours }, function(state) {
		lockr.set('hours', state)
	}, { deep: true })
})

socket.on(rkeys.HR.HOURS, v => Object.assign(state.hours, v))
socket.on(rkeys.HR.STATE, v => state.state = v)


