// 

export * from '../../common/robinhood'
import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as robinhood from '../../common/robinhood'
import * as http from './http'
import * as boom from 'boom'



export async function login(body: { username: string, password: string, mfa?: string }) {
	let response = await http.post('https://api.robinhood.com/oauth2/token/', {
		client_id: process.env.ROBINHOOD_CLIENT_ID,
		username: body.username,
		password: body.password,
		mfa_code: body.mfa,
		grant_type: 'password',
		scope: 'internal',
	}, { retries: 0 }) as Robinhood.Api.Login
	core.fix(response)
	// console.log('login response ->', response)
	return response
}

export async function refresh(rhtoken: string) {
	let response = await http.post('https://api.robinhood.com/oauth2/token/', {
		client_id: process.env.ROBINHOOD_CLIENT_ID,
		refresh_token: rhtoken,
		grant_type: 'refresh_token',
		scope: 'internal',
	}, { retries: 0 }) as Robinhood.Api.Login
	core.fix(response)
	// console.log('refresh response ->', response)
	return response
}

export async function validate(username: string, rhtoken: string) {
	let { results } = await http.get('https://api.robinhood.com/applications/', {
		rhtoken, retries: 0,
	}) as Robinhood.Api.Paginated<Robinhood.Application>
	if (!Array.isArray(results)) throw boom.badRequest('!results');
	if (results.length == 0) throw boom.notFound('Application not found.');
	results.forEach(core.fix)
	// console.log('validate results ->', results)
	let application = results[0]
	if (application.last_error || application.ready != true || application.state != 'approved') {
		throw boom.illegal(`Unapproved account. "${application.last_error}"`)
	}
	let user = await http.get(application.user, { rhtoken, retries: 0 }) as Robinhood.User
	core.fix(user)
	// console.log('validate user ->', user)
	if (user.username != username) {
		throw boom.unauthorized('Provided username does not match username on file.')
	}
}




