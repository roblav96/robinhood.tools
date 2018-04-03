// 
export * from '../../common/redis.keys' // export { rdkeys as rdkeys }
// 

import * as _ from 'lodash'
import * as core from '../../common/core'
import * as IORedis from 'ioredis'



class Redis extends IORedis {

	private static options(name: string, offset: number) {
		const options = {
			host: process.env.REDIS_HOST || 'localhost',
			port: (Number.parseInt(process.env.REDIS_PORT) || 6379) + offset,
			password: process.env.REDIS_PASSWORD,
			connectionName: '[' + process.INSTANCE + '][' + core.string.alphanumeric(process.NAME) + '][' + name + '][' + NODE_ENV + ']',
			db: 0, dropBufferSupport: true,
		} as IORedis.RedisOptions

		if (PRODUCTION) {
			options.path = '/var/run/redis_' + options.port + '.sock'
			_.unset(options, 'host'); _.unset(options, 'port');
		}

		return options
	}

	constructor(name: string, offset: number) {
		super(Redis.options(name, offset))
	}

}

export const main = new Redis('main', 0)
// export const pub = new Redis('pub', 0)
// export const sub = new Redis('sub', 0)
// export const logs = new Redis('logs', 0)



export function pipe(resolved: any[]) {
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





declare global {
	namespace Redis {
		type Coms = string[][]
		interface Event<T = any> { name: string, data: T }
	}
}







