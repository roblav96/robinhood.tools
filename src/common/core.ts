// 

import * as _ from 'lodash'



export function isBad(value) {
	if (value == null) return true;
	if (string.is(value) && value === '') return true;
	if (number.is(value) && !Number.isFinite(value)) return true;
	return false
}
export function isGood(value) { return !isBad(value) }

export const isNodejs = new Function('try { return this === global; } catch(e) { return false }')() as boolean

export function noop() { }



export const valid = {
	symbol(symbol: string): boolean {
		if (!string.is(symbol)) return false;
		return symbol.match(/[^a-zA-Z0-9]/) == null
	},
	email(email: string): boolean {
		if (!string.is(email)) return false;
		/** ████ maybe prevents future Regex vulnerabilities? */
		if (email.indexOf('@') == -1 || email.indexOf('.') == -1) return false;
		return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email)
	},
	headers(headers: Dict<string>, keys: string[]): string {
		let i: number, len = keys.length
		for (i = 0; i < len; i++) {
			let key = keys[i]
			if (headers[key] == null) return key;
		}
	},
}



export const string = {
	is(value): value is string { return typeof value == 'string' },
	id(id: string, tolower = false): string {
		id = id.replace(/\W+/g, '').trim()
		return tolower == true ? id.toLowerCase() : id
	},
	capitalizeWords(input: string) {
		return input.toLowerCase().split(' ').map(word => word[0].toUpperCase() + word.substr(1)).join(' ')
	},
	fuzzy(needle: string, haystack: string): boolean {
		if (!string.is(needle) || !string.is(haystack)) return false;
		let hlen = haystack.length
		let nlen = needle.length
		if (nlen > hlen) return false;
		if (nlen === hlen) return needle === haystack;
		outer: for (let i = 0, j = 0; i < nlen; i++) {
			let nch = needle.charCodeAt(i)
			while (j < hlen) {
				if (haystack.charCodeAt(j++) === nch) {
					continue outer
				}
			}
			return false
		}
		return true
	},
}



export const number = {
	is(value): value is number { return typeof value == 'number' },
	parseInt(value: string) {
		return Number.parseInt(value.replace(/[^0-9\.]/g, ''))
	},
	parseFloat(value: string) {
		return Number.parseFloat(value.replace(/[^0-9\.]/g, ''))
	},
	round(value: number, precision = 0) {
		value = +(Math.round(value + 'e+' + precision as any) + 'e-' + precision)
		return Number.isFinite(value) ? value : 0
	},
}



export const boolean = {
	is(value): value is boolean { return typeof value == 'boolean' },
}



export const object = {
	is<T>(target: T): target is T { return _.isPlainObject(target) },
	clone<T>(target: T): T { return JSON.parse(JSON.stringify(target)) },
	compact<T>(target: T) {
		Object.keys(target).forEach(function(key) {
			if (isBad(target[key])) _.unset(target, key);
		})
	},
	merge<T>(target: T, source: T) {
		Object.keys(source).forEach(function(key) {
			let svalue = source[key]
			if (isGood(svalue)) target[key] = svalue;
		})
	},
	repair<T>(target: T, source: T) {
		Object.keys(source).forEach(function(key) {
			let tvalue = target[key]
			let svalue = source[key]
			if (isBad(tvalue) && isGood(svalue)) target[key] = svalue;
		})
	},
	nullify<T>(target: T) {
		Object.keys(target).forEach(function(key) {
			target[key] = null
		})
	},
	fix<T>(target: T, deep = false) {
		if (!object.is(target)) return;
		Object.keys(target).forEach(function(key) {
			let value = target[key]
			if (deep == true && object.is(value)) {
				return object.fix(value, true)
			}
			if (!string.is(value) || value === '') return;
			if (!isNaN(value as any) && value.match(/[^0-9.-]/) == null) {
				target[key] = Number.parseFloat(value)
			} else if (value == 'true' || value == 'false') {
				target[key] = JSON.parse(value)
			}
		})
	},
}



export const array = {
	is(items): items is any[] { return Array.isArray(items) },
	create(length: number) {
		return Array.from(Array(length), (v, i) => i)
	},
	chunks<T>(items: T[], nchunks: number) {
		let chunks = Array.from(Array(nchunks), v => []) as T[][]
		items.forEach((v, i) => chunks[i % chunks.length].push(v))
		return chunks
	},
	// ichunk<T>(items: T[]): T[] {
	// 	if (process.MASTER) return items;
	// 	return array.chunks(items, process.INSTANCES)[process.INSTANCE]
	// },
	merge<T>(target: T[], source: T[], key: string) {
		source.forEach(function(item, i) {
			let found = target.find(v => v && v[key] == item[key])
			if (found) object.merge(found, item);
			else target.push(item);
		})
	},
	dict<T>(items: T[], key: string): Dict<T> {
		return items.reduce(function(previous, current, i) {
			previous[current[key]] = current
			return previous
		}, {})
	}
}



export const json = {
	is<T>(target: T): target is T {
		if (string.is(target)) {
			if (target.charAt(0) == '{' && target.charAt(target.length - 1) == '}') return true;
			if (target.charAt(0) == '[' && target.charAt(target.length - 1) == ']') return true;
		}
		return false
	},
	/** ████ ONLY use assuming target as object */
	parse<T>(target: T): T {
		return json.is(target) ? JSON.parse(target as any) : target
	},
}




