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
state = lockr.get('hours', state)
store.registerModule('hours', { state })
declare global { namespace Store { interface State { hours: typeof state } } }

setImmediate(function() {
	store.watch(function(state) { return state.security.ready }, async function(ready) {
		let response = await http.get('/hours') as typeof state
		Object.assign(state, response)
	})
})

socket.on(rkeys.HR.HOURS, v => Object.assign(state.hours, v))
socket.on(rkeys.HR.STATE, v => state.state = v)


