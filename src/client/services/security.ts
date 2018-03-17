// 

import lockr from 'lockr'
import Fingerprint2 from 'fingerprintjs2'
import * as common from '@/common'
import * as store from './store'
import * as http from './http'



export const state = {
	ready: false,
	human: false,
}



const doc = {} as Security.Doc

function initUuid() {
	let uuid = lockr.get('security.uuid', '')
	if (uuid) return Promise.resolve(uuid);
	return common.security.generatePrime(32).then(function(uuid) {
		lockr.set('security.uuid', uuid)
		return Promise.resolve(uuid)
	})
}

function initFinger() {
	let finger = lockr.get('security.finger', '')
	if (finger) return Promise.resolve(finger);
	return new Promise<string>(function(resolve) {
		new Fingerprint2().get(function(finger) {
			lockr.set('security.finger', finger) // common.security.sha256(finger))
			resolve(finger)
		})
	})
}

function initToken() {
	return http.get('/security/token', {
		now: Date.now(),
	}, { retries: 999 }).then(function(response) {
		// console.log('response', response)
		// doc.id = response.id
		doc.token = response.token
	}).catch(function(error) {
		console.error('initToken error >', error)
		// return initToken()
	})
}

export function init() {
	return Promise.all([
		initUuid(), initFinger(),
	]).then(function(resolved) {
		doc.uuid = resolved[0]
		doc.finger = resolved[1]
		return initToken()
	}).finally(() => state.ready = false)
}

export function getHeaders() {
	let headers = {
		'x-id': doc.id,
		'x-uuid': doc.uuid,
		'x-finger': doc.finger,
	} as Dict<string>
	if (doc.token) {
		headers['x-token'] = doc.token + '.' + Date.now()
	}
	return headers
}





