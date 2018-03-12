// 

import SecureLS from 'secure-ls'



const sls = new SecureLS({ encodingType: 'aes' })

// console.warn('storage.clear'); sls.clear();

export function get<T = any>(key: string, def = null as T): T {
	return sls.get(key) || def
}

export function set(key: string, value: any) {
	sls.set(key, value)
}

export function remove(key: string) {
	sls.remove(key)
}

export function clear() {
	sls.clear()
}


