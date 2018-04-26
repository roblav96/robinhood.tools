// 
export * from '@/common/security'
// 

import * as _ from '@/common/lodash'
import * as core from '@/common/core'
import lockr from 'lockr'
import Fingerprint2 from 'fingerprintjs2'
import store from '@/client/store'
import socket from '@/client/adapters/socket'
import * as http from '@/client/adapters/http'
import * as security from '@/common/security'
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
		'x-id': doc.id,
		'x-uuid': doc.uuid,
		'x-finger': doc.finger + '.' + Date.now(),
	} as Dict<string>
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

function token(): Promise<string[]> {
	// return http.get('/security/token').catch(function(error) {
	return http.post('/security/token', { uuid: doc.uuid }, {
		query: { finger: doc.finger },
	}).catch(function(error) {
		// console.error('token Error ->', error.message)
		return clock.toPromise('10s').then(token)
	})
}

Promise.all([
	uuid(), finger(),
]).then(function() {
	return token()
}).then(function() {
	return http.get('/websocket/addresses')
}).then(function(addresses) {
	return socket.init(addresses)
}).then(function() {
	state.ready = true
})


