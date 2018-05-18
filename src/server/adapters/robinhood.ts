// 

export * from '../../common/robinhood'
import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as rkeys from '../../common/rkeys'
import * as robinhood from '../../common/robinhood'
import * as redis from './redis'
import * as http from './http'
import * as boom from 'boom'
import * as pForever from 'p-forever'
import dayjs from '../../common/dayjs'



export async function login(body: { username: string, password: string, mfa?: string }) {
	let response = await http.post('https://api.robinhood.com/oauth2/token/', {
		client_id: process.env.ROBINHOOD_CLIENT_ID,
		username: body.username,
		password: body.password,
		mfa_code: body.mfa,
		grant_type: 'password',
		scope: 'internal',
	}, { retries: 0 }) as Robinhood.Oauth
	core.fix(response)
	return response
}

export async function refresh(rhrefresh: string) {
	let response = await http.post('https://api.robinhood.com/oauth2/token/', {
		client_id: process.env.ROBINHOOD_CLIENT_ID,
		refresh_token: rhrefresh,
		grant_type: 'refresh_token',
		scope: 'internal',
	}, { retries: 0 }) as Robinhood.Oauth
	core.fix(response)
	return response
}

export async function revoke(rhtoken: string) {
	let response = await http.post('https://api.robinhood.com/oauth2/revoke_token/', {
		client_id: process.env.ROBINHOOD_CLIENT_ID,
		token: rhtoken,
	}, { retries: 0 })
	core.fix(response)
	return response
}



export async function paginated(config: Partial<Http.Config>) {
	_.defaults(config, { method: 'GET', retries: 0 } as Http.Config)
	let items = []
	await pForever(async url => {
		config.url = url
		let { results, next } = await http.request(config) as Robinhood.Api.Paginated
		results.forEach(v => {
			core.fix(v, true)
			items.push(v)
		})
		return next || pForever.end
	}, config.url)
	return items
}

export const sync = {

	accounts(rhtoken: string) {
		return paginated({ url: 'https://api.robinhood.com/accounts/', rhtoken }) as Promise<Robinhood.Account[]>
	},

	applications(rhtoken: string) {
		return paginated({ url: 'https://api.robinhood.com/applications/', rhtoken }) as Promise<Robinhood.Application[]>
	},

	orders(rhtoken: string, opts = { all: false }) {
		let query = opts.all ? {} : { 'updated_at[gte]': dayjs().subtract(1, 'day').format('YYYY-MM-DD') }
		return paginated({ url: 'https://api.robinhood.com/orders/', query, rhtoken }) as Promise<Robinhood.Order[]>
	},

	portfolios(rhtoken: string) {
		let response = await http.get(`https://api.robinhood.com/portfolios/${rhaccount}/`, {
			rhtoken, retries: 0,
		}) as Robinhood.Portfolio
		core.fix(response)
		return response
	},

	async positions({ rhtoken, rhaccount }: Security.Doc, opts = { all: false }) {
		let { results } = await http.get(`https://api.robinhood.com/accounts/${rhaccount}/positions/`, {
			query: { nonzero: !opts.all }, rhtoken, retries: 0,
		}) as Robinhood.Api.Paginated<Robinhood.Position>
		results.forEach(core.fix)
		return results
	},

	async subscriptions({ rhtoken }: Security.Doc) {
		let { results } = await http.get('https://api.robinhood.com/subscription/subscriptions/', {
			rhtoken, retries: 0,
		}) as Robinhood.Api.Paginated<Robinhood.Subscription>
		results.forEach(core.fix)
		return results
	},

	async transfers({ rhtoken }: Security.Doc, opts = { all: false }) {
		let query = !opts.all ? { 'updated_at[gte]': dayjs().subtract(1, 'week').format('YYYY-MM-DD') } : {}
		let transfers = [] as Robinhood.Order[]
		await pForever(async url => {
			let { results, next } = await http.get(url, {
				query, rhtoken, retries: 0,
			}) as Robinhood.Api.Paginated<Robinhood.Order>
			results.forEach(v => {
				core.fix(v)
				v.executions.forEach(core.fix)
				transfers.push(v)
			})
			return next || pForever.end
		}, 'https://api.robinhood.com/ach/transfers/')
		return transfers
	},

	async user({ rhtoken }: Security.Doc) {
		let response = await http.get('https://api.robinhood.com/user/', {
			rhtoken, retries: 0,
		}) as Robinhood.User
		core.fix(response)
		return response
	},

	async watchlist({ rhtoken }: Security.Doc) {
		let { results } = await http.get('https://api.robinhood.com/watchlists/Default/', {
			rhtoken, retries: 0,
		}) as Robinhood.Api.Paginated<Robinhood.WatchlistResult>
		results.forEach(core.fix)
		let wlists = results.map(v => ({
			watchlist: v.watchlist.split('/').splice(-2, 1)[0],
			instrument: v.instrument.split('/').splice(-2, 1)[0],
			created_at: new Date(v.created_at).valueOf(),
		} as Robinhood.Watchlist))
		let ids = wlists.map(v => v.instrument)
		let dsymbols = await redis.main.hmget(rkeys.RH.IDS, ...ids)
		dsymbols = redis.fixHmget(dsymbols, ids)
		wlists.forEach(v => v.symbol = dsymbols[v.instrument])
		return wlists
	},

}

// export async function ________({ rhtoken }: Security.Doc) {
// 	let response = await http.get('________', {
// 		rhtoken,
// 	}) as ________
// 	core.fix(response)
// 	return response
// }





// export async function validate(rhusername: string, rhtoken: string) {
// 	let { results } = await http.get('https://api.robinhood.com/applications/', {
// 		rhtoken, retries: 0,
// 	}) as Robinhood.Api.Paginated<Robinhood.Application>
// 	if (!Array.isArray(results)) return '!results';
// 	if (results.length == 0) return 'Application not found.';
// 	results.forEach(core.fix)
// 	let application = results[0]
// 	if (application.last_error || application.ready != true || application.state != 'approved') {
// 		return 'Unapproved account.'
// 	}
// 	let user = await http.get(application.user, { rhtoken, retries: 0 }) as Robinhood.User
// 	core.fix(user)
// 	if (user.username != rhusername) {
// 		return 'Provided username does not match username on file.'
// 	}
// }




