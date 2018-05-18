// 

export * from '@/common/security'
import * as security from '@/common/security'
import * as _ from '@/common/lodash'
import * as core from '@/common/core'
import * as boom from 'boom'
import lockr from 'lockr'
import Fingerprint2 from 'fingerprintjs2'
import clock from '@/common/clock'
import store from '@/client/store'
import socket from '@/client/adapters/socket'
import * as http from '@/client/adapters/http'



const state = {
	ready: false,
	ishuman: false,
	rhusername: '',
	rhaccount: '',
}
store.register('security', state)
declare global { namespace Store { interface State { security: typeof state } } }



export const doc = {
	uuid: lockr.get('security.uuid'),
	finger: lockr.get('security.finger'),
	get rhusername() { return state.rhusername },
	get rhaccount() { return state.rhaccount },
} as Security.Doc

export function headers() {
	let headers = {
		'x-uuid': `${doc.uuid}.${Date.now()}`,
		'x-finger': doc.finger,
	} as Dict<string>
	return headers
}



export function token(): Promise<void> {
	return Promise.resolve().then(function() {
		if (!doc.uuid) {
			doc.uuid = security.randomBits(security.LENGTHS.uuid)
			lockr.set('security.uuid', doc.uuid)
		}
		return doc.finger ? doc.finger : new Promise<string>(function(resolve) {
			new Fingerprint2().get(resolve)
		})

	}).then(function(finger) {
		doc.finger = finger
		lockr.set('security.finger', doc.finger)
		return http.get('/security/token', { retries: Infinity })

	}).then(function(response: Security.Doc) {
		Object.assign(state, response);
		state.ready = true

	}).catch(function(error) {
		console.error('token Error ->', error)
		if (boom.isBoom(error) && error.output.statusCode == 401) {
			core.object.nullify(doc)
		}
		return new Promise(r => setTimeout(r, 3000)).then(token)
	})
}


