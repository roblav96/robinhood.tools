// 

export * from '@/common/security'
import * as _ from 'lodash'
import * as core from '@/common/core'
import lockr from 'lockr'
import Fingerprint2 from 'fingerprintjs2'
import pdelay from 'delay'
import store from '@/client/store'
import socket from '@/client/adapters/socket'
import * as security from '@/common/security'
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
		'x-id': doc.id,
		'x-uuid': doc.uuid,
		'x-finger': doc.finger,
	} as Dict<string>
	if (doc.token) headers['x-token'] = doc.token + '.' + Date.now();
	return headers
}



function uuid() {
	if (doc.uuid) return;
	return security.generateProbablePrime(32).then(function(uuid) {
		lockr.set('security.uuid', uuid)
		doc.uuid = uuid
	})
}

function finger() {
	if (doc.finger) return;
	return new Promise(function(resolve) {
		new Fingerprint2().get(function(finger) {
			// finger = security.hash256(finger)
			lockr.set('security.finger', finger)
			doc.finger = finger
			resolve()
		})
	})
}

function token() {
	return http.post<Security.TokenRequest, Security.TokenReply>('/security/token', {
		now: Date.now(),
	}).then(function(response) {
		console.log('response ->', response)
		doc.token = response.token
	}).catch(function(error) {
		console.error('token Error ->', error)
		return pdelay(DEVELOPMENT ? 5000 : 3000).then(token)
	})
}

Promise.all([
	uuid(), finger(),
]).then(function() {
	return token()
}).then(function() {
	state.ready = true
	socket.init()
})






