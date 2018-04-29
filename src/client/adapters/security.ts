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

export function headers(): Dict<string> {
	return {
		'x-id': doc.id,
		'x-uuid': doc.uuid,
		'x-finger': doc.finger + '.' + Date.now(),
	}
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

// Promise.all([
// 	uuid(), finger(),
// ]).then(function() {
// 	return http.get('/security/token', { retries: 0 })
// 	// }).then(function() {
// 	// 	return http.get('/websocket/discover', { retries: Infinity })
// 	// }).then(function(addresses) {
// 	// 	return socket.init(addresses)
// }).then(function() {
// 	state.ready = true
// })





// clock.on('30s', function ontock(i: number) {
// http.post('http://localhost:12300/api/benchmark', {
http.post('/benchmark', {
	random: Math.random().toString(16),
}).then(function(response) {
	console.log('response ->', response)
}).catch(function(error) {
	console.error('polka Error ->', error)
})
// }).emit('30s', 0)


