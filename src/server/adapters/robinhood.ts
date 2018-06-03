// 

export * from '../../common/robinhood'
import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as rkeys from '../../common/rkeys'
import * as robinhood from '../../common/robinhood'
import * as redis from './redis'
import * as http from '../../common/http'
import * as boom from 'boom'
import * as pAll from 'p-all'
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

	accounts({ rhtoken }: Security.Doc) {
		return paginated({ url: 'https://api.robinhood.com/accounts/', rhtoken }) as Promise<Robinhood.Account[]>
	},

	achrelationships({ rhtoken }: Security.Doc) {
		return paginated({ url: 'https://api.robinhood.com/ach/relationships/', rhtoken }) as Promise<Robinhood.AchRelationship[]>
	},

	achtransfers({ rhtoken }: Security.Doc, opts = { all: false }) {
		let query = opts.all ? {} : { 'updated_at[gte]': dayjs().subtract(1, 'week').format('YYYY-MM-DD') }
		return paginated({ url: 'https://api.robinhood.com/ach/transfers/', query, rhtoken }) as Promise<Robinhood.AchTransfer[]>
	},

	applications({ rhtoken }: Security.Doc) {
		return paginated({ url: 'https://api.robinhood.com/applications/', rhtoken }) as Promise<Robinhood.Application[]>
	},

	orders({ rhtoken }: Security.Doc, opts = { all: false }) {
		let query = opts.all ? {} : { 'updated_at[gte]': dayjs().subtract(1, 'week').format('YYYY-MM-DD') }
		return paginated({ url: 'https://api.robinhood.com/orders/', query, rhtoken }) as Promise<Robinhood.Order[]>
	},

	portfolios({ rhtoken }: Security.Doc) {
		return paginated({ url: 'https://api.robinhood.com/portfolios/', rhtoken }) as Promise<Robinhood.Portfolio[]>
	},

	async positions({ rhtoken }: Security.Doc, opts = { all: false }) {
		let query = { nonzero: !opts.all }
		let positions = await paginated({ url: 'https://api.robinhood.com/positions/', query, rhtoken }) as Robinhood.Position[]
		let dsymbols = await dSymbols(positions.map(v => v.instrument))
		positions.forEach(v => v.symbol = dsymbols[v.instrument])
		return positions
	},

	subscriptions({ rhtoken }: Security.Doc, opts = { all: false }) {
		let query = { active: !opts.all }
		return paginated({ url: 'https://api.robinhood.com/subscription/subscriptions/', query, rhtoken }) as Promise<Robinhood.Subscription[]>
	},

	async user({ rhtoken }: Security.Doc) {
		let user = await http.get('https://api.robinhood.com/user/', { rhtoken, retries: 0 }) as Robinhood.User
		core.fix(user)
		return user
	},

	async watchlists({ rhtoken }: Security.Doc) {
		let lists = await paginated({ url: 'https://api.robinhood.com/watchlists/', rhtoken }) as Robinhood.WatchlistMeta[]
		let watchlists = _.flatten(await pAll(lists.map(list => {
			return () => paginated({ url: list.url, rhtoken }) as Promise<Robinhood.Watchlist[]>
		})))
		let dsymbols = await dSymbols(watchlists.map(v => v.instrument))
		watchlists.forEach(v => v.symbol = dsymbols[v.instrument])
		return watchlists
	},

}



export async function dSymbols(instruments: string[]) {
	let dsymbols = await redis.main.hmget(rkeys.RH.IDS, ...instruments)
	return redis.fixHmget(dsymbols, instruments) as Dict<string>
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




