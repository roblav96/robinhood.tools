// 

import lockr from 'lockr'
import store from '../store'
import socket from '../adapters/socket'
import * as _ from '../../common/lodash'
import * as http from '../../common/http'
import * as rkeys from '../../common/rkeys'



let hours = {
	hours: null as Hours,
	state: null as Hours.State,
}
Object.assign(hours, lockr.get('hours', hours))
store.register('hours', hours)
export default hours
declare global { namespace Store { interface State { hours: typeof hours } } }

_.defer(function() {

	store.watch(function(state) { return state.security.ready }, function(ready) {
		http.get('/hours', { retries: Infinity }).then(function(response: typeof hours) {
			Object.assign(hours, response)
		}).catch(error => console.error('watch security.ready Error ->', error))
	})

	store.watch(function(state) { return state.hours }, function(state) {
		lockr.set('hours', state)
	}, { deep: true })

	socket.on(rkeys.HR.HOURS, v => Object.assign(hours.hours, v))
	socket.on(rkeys.HR.STATE, v => hours.state = v)

})


