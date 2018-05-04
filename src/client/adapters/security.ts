// 
export * from '@/common/security'
// 

import * as security from '@/common/security'
import * as _ from '@/common/lodash'
import * as core from '@/common/core'
import lockr from 'lockr'
import Fingerprint2 from 'fingerprintjs2'
import store from '@/client/store'
import socket from '@/client/adapters/socket'
import * as http from '@/client/adapters/http'
import clock from '@/common/clock'



const state = {
	ready: false,
	human: false,
}
store.registerModule('security', { state })
declare global { namespace Store { interface State { security: typeof state } } }



const doc = {
	id: lockr.get('security.id'),
	uuid: lockr.get('security.uuid'),
	finger: lockr.get('security.finger'),
} as Security.Doc

export function headers() {
	let headers = {
		'x-uuid': `${doc.uuid}.${Date.now()}`,
		'x-finger': doc.finger,
	} as Dict<string>
	if (doc.id) headers['x-id'] = doc.id;
	return headers
}



function uuid(): Promise<void> {
	if (doc.uuid) return;
	return security.generateProbablePrime(32).then(function(uuid) {
		lockr.set('security.uuid', uuid)
		doc.uuid = uuid
	})
}

function finger(): Promise<void> {
	if (doc.finger) return;
	return new Promise(function(resolve) {
		new Fingerprint2().get(function(finger) {
			finger = security.sha1(finger)
			lockr.set('security.finger', finger)
			doc.finger = finger
			resolve()
		})
	})
}



Promise.all([
	uuid(), finger(),
]).then(function() {
	return http.get('/security/token', { retryTick: '1s', retries: Infinity })
}).then(function() {
	return socket.discover()
}).then(function() {
	state.ready = true
}).catch(function(error) {
	console.error('init Error ->', error)
})



// http.post('/search', {
// 	query: 'nvda',
// }).then(function(response) {
// 	// console.log('response ->', response)
// }).catch(function(error) {
// 	console.error('polka Error ->', error)
// })


