// 

import * as _ from './lodash'



export function observe(this: any, keys: string[], handler: (key: string) => void) {
	let i: number, len = keys.length
	for (i = 0; i < len; i++) {
		let key = keys[i]
		Object.assign(this, { [`_${key}_`]: this[key] })
		Object.assign(this, {
			[key](...args) {
				handler.apply(this, [key])
				return this[`_${key}_`](...args)
			}
		})
	}
}



export function proxy<T = any>(target: T, fn: (property: any) => void): T {
	const handler = {
		get(target, property, receiver) {
			console.log('get ->', property)
			// try {
			// 	return new Proxy(target[property], handler)
			// } catch (err) {
			return Reflect.get(target, property, receiver)
			// }
		},
		defineProperty(target, property, descriptor) {
			console.log('defineProperty ->', property, descriptor)
			fn(property)
			return Reflect.defineProperty(target, property, descriptor)
		},
		deleteProperty(target, property) {
			console.log('deleteProperty ->', property)
			fn(property)
			return Reflect.deleteProperty(target, property)
		}
	} as ProxyHandler<object>
	return new Proxy(target as any, handler)
}


