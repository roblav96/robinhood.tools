// 



export function observe<T = any>(target: T, fn: () => void): T {
	const handler = {
		get(target, property, receiver) {
			try {
				return new Proxy(target[property], handler)
			} catch (err) {
				return Reflect.get(target, property, receiver)
			}
		},
		defineProperty(target, property, descriptor) {
			fn()
			return Reflect.defineProperty(target, property, descriptor)
		},
		deleteProperty(target, property) {
			fn()
			return Reflect.deleteProperty(target, property)
		}
	} as ProxyHandler<object>
	return new Proxy(target as any, handler)
}


