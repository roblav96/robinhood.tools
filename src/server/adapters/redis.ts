// 

import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as IORedis from 'ioredis'



class Redis extends IORedis {

	private static opts(name: string, offset: number) {
		const opts = {
			host: process.env.REDIS_HOST || '127.0.0.1',
			port: (Number.parseInt(process.env.REDIS_PORT) || 6379) + offset,
			password: process.env.REDIS_PASSWORD,
			connectionName: '[' + process.env.INSTANCE + '][' + core.string.alphanumeric(process.env.NAME) + '][' + name + '][' + process.env.NODE_ENV + ']',
			db: 0, dropBufferSupport: true,
		} as IORedis.RedisOptions

		if (process.env.PRODUCTION) {
			opts.path = '/var/run/redis_' + opts.port + '.sock'
			delete opts.host; delete opts.port
		}

		return opts
	}

	constructor(name: string, offset: number) {
		super(Redis.opts(name, offset))
	}

	coms(coms: Redis.Coms): Promise<any[]> {
		return this.pipeline(coms).exec().then(fixPipeline) as any
	}

	async purge(rkey: string, pattern = ':*') {
		let keys = await this.keys(rkey + pattern)
		console.warn('PURGING ->', rkey + pattern, '->', keys.length)
		await this.coms(keys.map(v => ['del', v]))
		return keys
	}

}

export const main = new Redis('main', 0)
// export const pub = new Redis('pub', 0)
// export const sub = new Redis('sub', 0)
// export const logs = new Redis('logs', 0)



export function fixHmget(hmget: any, keys: string[]) {
	let fixed = {} as any
	hmget.forEach((v, i) => fixed[keys[i]] = v)
	return fixed
}

export function fixPipeline(resolved: any[]) {
	if (Array.isArray(resolved)) {
		let i: number, len = resolved.length
		for (i = 0; i < len; i++) {
			let result = resolved[i]
			let error = result[0]
			if (error) throw new Error(error);
			resolved[i] = result[1]
		}
	}
	return resolved
}

export function toHset(from: any): any {
	let to = {}
	Object.keys(from).forEach(function(key) {
		let value = from[key]
		if (value == null) value = null;
		if (Number.isFinite(value)) value = core.number.round(value, 8);
		to[key] = JSON.stringify(value)
	})
	return to
}

export function fromHget(to: any): any {
	Object.keys(to).forEach(function(key) {
		to[key] = JSON.parse(to[key])
	})
	return to
}

export function fromHmget(values: any[], keys: string[]): any {
	let to = {}
	values.forEach((v, i) => to[keys[i]] = v)
	return fromHget(to)
}



export class SetsComs {
	private _sadds = ['sadd', this.rkey]
	private _srems = ['srem', this.rkey]
	constructor(public rkey: string) { }
	sadd(value: any) {
		this._sadds.push(value)
	}
	srem(value: any) {
		this._srems.push(value)
	}
	merge(coms: Redis.Coms) {
		if (this._sadds.length > 2) coms.push(this._sadds);
		if (this._srems.length > 2) coms.push(this._srems);
	}
}





declare global {
	namespace Redis {
		type Coms = string[][]
		interface Event<T = any> { name: string, data: T }
	}
}







