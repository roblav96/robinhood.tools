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

function finger() {
	return new Promise<string>(function(resolve) {
		new Fingerprint2().get(resolve)
	})
}

export async function init() {
	if (!doc.uuid) {
		doc.uuid = security.randomBits(32)
		lockr.set('security.uuid', doc.uuid)
	}
	if (!doc.finger) {
		doc.finger = await finger()
		lockr.set('security.finger', doc.finger)
	}
	await http.get('/security/token', { retryTick: '1s', retries: Infinity })
	state.ready = true
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


