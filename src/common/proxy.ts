// 

import * as _ from './lodash'



export function observe(this: any, keys: string[], handler: (key: string) => void) {
	let i: number, len = keys.length
	for (i = 0; i < len; i++) {
		let key = keys[i]
		Object.assign(this, { [`_${key}_`]: this[key] })
		Object.assign(this, {
			[key](...args) {
				handler.call(this, key)
				return this[`_${key}_`](...args)
			}
		})
	}
}



export function proxy<T = any>(target: T, fn: (method: string, property: string) => void): T {
	const handler = {
		get(target, property, receiver) {
			fn.apply(target, ['get', property])
			return Reflect.get(target, property, receiver)
			// try {
			// 	return new Proxy(target[property], handler)
			// } catch (err) {
			// 	return Reflect.get(target, property, receiver)
			// }
		},
		defineProperty(target, property, descriptor) {
			fn.apply(target, ['defineProperty', property])
			// console.log('defineProperty ->', property, descriptor)
			return Reflect.defineProperty(target, property, descriptor)
		},
		deleteProperty(target, property) {
			fn.apply(target, ['deleteProperty', property])
			// console.log('deleteProperty ->', property)
			return Reflect.deleteProperty(target, property)
		}
	} as ProxyHandler<object>
	return new Proxy(target as any, handler)
}


