// 

export * from '../../common/security'
import * as security from '../../common/security'
import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as boom from 'boom'
import * as cookie from 'cookie'
import * as url from 'url'
import lockr from 'lockr'
import Fingerprint2 from 'fingerprintjs2'
import clock from '../../common/clock'
import store from '../store'
import * as http from '../../common/http'



const state = {
	ready: false,
	ishuman: false,
	rhusername: '',
}
store.register('security', state)
declare global { namespace Store { interface State { security: typeof state } } }



export const doc = {
	uuid: lockr.get('security.uuid'),
	finger: lockr.get('security.finger'),
} as Security.Doc

// export function headers() {
// 	let headers = {
// 		'x-uuid': `${doc.uuid}.${Date.now()}`,
// 		'x-finger': doc.finger,
// 	} as Dict<string>
// 	return headers
// }

const copts = {
	// domain: core.HOSTNAME,
	domain: process.env.DOMAIN,
	path: '/', sameSite: true,
} as cookie.CookieSerializeOptions

export function cookies() {
	document.cookie = cookie.serialize('x-uuid', `${doc.uuid}.${Date.now()}`, copts)
	document.cookie = cookie.serialize('x-finger', doc.finger, copts)
}
global.cookies = cookies



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
		Object.assign(state, response)
		state.ready = true

	}).catch(function(error: boom) {
		console.error('token Error ->', error)
		console.dir(error)
		if (error && error.isBoom && error.output.statusCode == 401) {
			core.nullify(doc)
		}
		return new Promise(r => setTimeout(r, 3000)).then(token)
	})
}


