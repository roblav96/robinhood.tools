// 

export * from '../../common/robinhood'
import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as robinhood from '../../common/robinhood'
import * as http from './http'
import * as boom from 'boom'



export async function login(username: string, password: string, mfa?: string) {
	let response = await http.post('https://api.robinhood.com/oauth2/token/', {
		client_id: process.env.ROBINHOOD_CLIENT_ID,
		username, password,
		mfa_code: mfa,
		grant_type: 'password',
		scope: 'internal',
	}) as Robinhood.Api.Login
	core.fix(response)
	console.log('login response ->', response)
	return response
}

export async function refresh(rhtoken: string) {
	let response = await http.post('https://api.robinhood.com/oauth2/token/', {
		client_id: process.env.ROBINHOOD_CLIENT_ID,
		refresh_token: rhtoken,
		grant_type: 'refresh_token',
		scope: 'internal',
	})
	core.fix(response)
	console.log('refresh response ->', response)
	return response
}

export async function validate(username: string, rhtoken: string) {
	let applications = await http.post('https://api.robinhood.com/applications/') as Robinhood.Api.Paginated<Robinhood.Application>
	core.fix(applications)
	console.log('validate applications ->', applications)
	if (_.isEmpty(applications.results)) {
		throw boom.notFound('Application not found.')
	}
	let application = applications.results[0]
	if (application.last_error || application.ready != true || application.state != 'approved') {
		throw boom.illegal(`Unapproved account. "${application.last_error}"`)
	}
	let user = await http.get(application.user, { rhtoken }) as Robinhood.User
	core.fix(user)
	console.log('validate user ->', user)
	if (user.username != username) {
		throw boom.unauthorized('Provided username does not match username on file.')
	}
	return true
}




