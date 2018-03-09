//

import * as eyes from 'eyes'
import * as clc from 'cli-color'
import * as _ from 'rambda'
import * as common from '../../common'

import * as ioredis from 'ioredis'



class Redis extends ioredis {

	static getOpts() {
		let opts = {
			host: process.env.REDIS_HOST,
			port: Number.parseInt(process.env.REDIS_PORT),
			password: process.env.REDIS_PASSWORD,
			db: 0,
			dropBufferSupport: true,
			connectionName: '[' + INSTANCE + '][' + common.string.id(process.env.DNAME) + '][' + NODE_ENV + ']',
		} as ioredis.RedisOptions

		if (PRODUCTION) {
			opts.path = '/var/run/redis_' + opts.port + '.sock'
			opts = _.omit(['host', 'port'], opts)
		}

		return opts
	}

	constructor() {
		super(Redis.getOpts())
	}

	pipelinecoms(coms: Redis.Coms, fix = true): Promise<any[]> {
		return super.pipeline(coms).exec().then(function(resolved) {
			if (fix == true && Array.isArray(resolved)) {
				let i: number, len = resolved.length
				for (i = 0; i < len; i++) {
					let result = resolved[i]
					let error = result[0]
					if (error != null) {
						console.error(clc.red.bold('>>>> REDIS PIPELINE ERROR <<<<'))
						throw new Error(error)
					}
					resolved[i] = result[1]
				}
			}
			return Promise.resolve(resolved)
		})
	}

	tohset(item: any): any {
		if (!common.object.is(item)) return {};
		let toitem = {}
		Object.keys(item).forEach(function(key) {
			let value = item[key]
			if (value == null) value = null;
			if (Number.isFinite(value)) value = common.number.round(value, 8);
			toitem[key] = JSON.stringify(value)
		})
		return toitem
	}

	fromhget(item: any): any {
		if (!common.object.is(item)) return {};
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



export default new Redis()





declare global {
	namespace Redis {
		type Coms = string[][]
		type Resolved = string[][]
		interface PublishEvent<T = any> {
			name: string
			data: T
		}
	}
}







