// 

import * as _ from './lodash'

export function observe<T>(target: T, handler: (key: keyof T) => void): T {
	return new Proxy(target as any, {
		get(target, property, receiver) {
			_.defer(handler, property)
			return Reflect.get(target, property, receiver)
		},
	})
}





// export function observe<T>(
// 	target: T,
// 	handler: (
// 		// method: string,
// 		// method: keyof typeof Reflect,
// 		// method: 'get' | 'defineProperty' | 'deleteProperty',
// 		// property: string,
// 		key: keyof T,
// 	) => void,
// ): T {
// 	const config = {
// 		get(target, property, receiver) {
// 			// console.log('get ->', property, receiver)
// 			// handler('get', property as any)
// 			setTimeout(handler, 0, property)
// 			// handler(property as any)
// 			// handler.apply(target, ['get', property])
// 			return Reflect.get(target, property, receiver)
// 			// try {
// 			// 	return new Proxy(target[property], config)
// 			// } catch (err) {
// 			// 	return Reflect.get(target, property, receiver)
// 			// }
// 		},
// 		// defineProperty(target, property, descriptor) {
// 		// 	// console.log('defineProperty ->', property, descriptor)
// 		// 	handler('defineProperty', property as any)
// 		// 	// handler.apply(target, ['defineProperty', property])
// 		// 	return Reflect.defineProperty(target, property, descriptor)
// 		// },
// 		// deleteProperty(target, property) {
// 		// 	// console.log('deleteProperty ->', property)
// 		// 	handler('deleteProperty', property as any)
// 		// 	// handler.apply(target, ['deleteProperty', property])
// 		// 	return Reflect.deleteProperty(target, property)
// 		// },
// 		// enumerate(target) {
// 		// 	handler('enumerate', target as any)
// 		// 	return Reflect.enumerate(target) as any
// 		// },
// 	} as ProxyHandler<any>
// 	return new Proxy(target as any, config)
// }



// export default function proxy<T = any>(target: T, fn: (method: string, property: string) => void): T {
// 	const handler = {
// 		get(target, property, receiver) {
// 			fn.apply(target, ['get', property])
// 			return Reflect.get(target, property, receiver)
// 			// try {
// 			// 	return new Proxy(target[property], handler)
// 			// } catch (err) {
// 			// 	return Reflect.get(target, property, receiver)
// 			// }
// 		},
// 		defineProperty(target, property, descriptor) {
// 			fn.apply(target, ['defineProperty', property])
// 			// console.log('defineProperty ->', property, descriptor)
// 			return Reflect.defineProperty(target, property, descriptor)
// 		},
// 		deleteProperty(target, property) {
// 			fn.apply(target, ['deleteProperty', property])
// 			// console.log('deleteProperty ->', property)
// 			return Reflect.deleteProperty(target, property)
// 		}
// 	} as ProxyHandler<object>
// 	return new Proxy(target as any, handler)
// }





// export function observe(this: any, keys: string[], handler: (key: string) => void) {
// 	let i: number, len = keys.length
// 	for (i = 0; i < len; i++) {
// 		let key = keys[i]
// 		Object.assign(this, { [`_${key}_`]: this[key] })
// 		Object.assign(this, {
// 			[key](...args) {
// 				handler.call(this, key)
// 				return this[`_${key}_`](...args)
// 			}
// 		})
// 	}
// }


