// 

export * from '@/common/security'
import * as security from '@/common/security'
import * as _ from '@/common/lodash'
import * as core from '@/common/core'
import lockr from 'lockr'
import Fingerprint2 from 'fingerprintjs2'
import clock from '@/common/clock'
import store from '@/client/store'
import socket from '@/client/adapters/socket'
import * as http from '@/client/adapters/http'



const state = {
	ready: false,
	human: lockr.get('security.human', false),
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

export function token() {
	return Promise.resolve().then(function() {
		if (!doc.uuid) {
			doc.uuid = security.randomBits(32)
			lockr.set('security.uuid', doc.uuid)
		}
		return doc.finger ? doc.finger : new Promise<string>(function(resolve) {
			new Fingerprint2().get(resolve)
		})
	}).then(function(finger) {
		doc.finger = finger
		lockr.set('security.finger', doc.finger)
		return http.get('/security/token', { retryTick: '1s', retries: Infinity })
	}).then(function() {
		state.ready = true
	})
}





// Promise.all([
// 	uuid(), finger(),
// ]).then(function() {
// 	return http.get('/security/token', { retryTick: '1s', retries: Infinity })
// }).then(function() {
// 	return socket.discover()
// }).then(function() {
// 	state.ready = true
// }).catch(function(error) {
// 	console.error('init Error ->', error)
// })

// http.post('/search', {
// 	query: 'nvda',
// }).then(function(response) {
// 	// console.log('response ->', response)
// }).catch(function(error) {
// 	console.error('polka Error ->', error)
// })


