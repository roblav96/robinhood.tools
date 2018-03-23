//

import chalk from 'chalk'
import * as eyes from 'eyes'
import * as _ from 'lodash'
import * as core from '../../common/core'

import * as ioredis from 'ioredis'



class Redis extends ioredis {

	static getOpts(name: string, offset: number) {
		let opts = {
			db: 0, dropBufferSupport: true,
			host: process.env.REDIS_HOST || 'localhost',
			port: (Number.parseInt(process.env.REDIS_PORT) || 6379) + offset,
			password: process.env.REDIS_PASSWORD,
			connectionName: '[' + process.INSTANCE + '][' + core.string.id(process.NAME) + '][' + name.toUpperCase() + '][' + NODE_ENV + ']',
		} as ioredis.RedisOptions

		if (PRODUCTION) {
			opts.path = '/var/run/redis_' + opts.port + '.sock'
			_.unset(opts, 'host')
			_.unset(opts, 'port')
		}

		return opts
	}

	constructor(name: string, offset: number) {
		super(Redis.getOpts(name, offset))
	}

	fixpipeline(resolved: any[]) {
		if (Array.isArray(resolved)) {
			let i: number, len = resolved.length
			for (i = 0; i < len; i++) {
				let result = resolved[i]
				let error = result[0]
				if (error) throw new Error(error);
				resolved[i] = result[1]
			}
		}
		return Promise.resolve(resolved)
	}

	tohset(item: any): any {
		if (!core.object.is(item)) return {};
		let toitem = {}
		Object.keys(item).forEach(function(key) {
			let value = item[key]
			if (value == null) value = null;
			if (Number.isFinite(value)) value = core.number.round(value, 8);
			toitem[key] = JSON.stringify(value)
		})
		return toitem
	}

	fromhget(item: any): any {
		if (!core.object.is(item)) return {};
		Object.keys(item).forEach(function(k) {
			item[k] = JSON.parse(item[k])
		})
		return item
	}

	fromhmget(values: any[], keys: string[]): any {
		if (!Array.isArray(values) || !Array.isArray(keys)) return {};
		let item = {}
		values.forEach((v, i) => item[keys[i]] = v)
		return this.fromhget(item)
	}

}



export const main = new Redis('main', 0)
export const pub = new Redis('pub', 0)
export const sub = new Redis('sub', 0)





declare global {
	namespace Redis {
		type Coms = string[][]
		interface PublishEvent<T = any> {
			name: string
			data: T
		}
	}
}







