// 

import * as _ from 'lodash'



export function noop() { }

export function isJunk(value: any) {
	if (value == null) return true;
	if (string.is(value) && value === '') return true;
	if (number.is(value) && !Number.isFinite(value)) return true;
	return false
}
// export function isTruthy(value: any) { return !isFalsey(value) }

export const isBrowser = !new Function('try { return this === global; } catch(e) { return false }')()
export const isNodejs = !isBrowser



export function fix(target: any) {
	Object.keys(target).forEach(function(key) {
		let value = target[key]
		if (value == null) return;
		// else if (object.is(value)) fix(value);
		else if (!string.is(value)) return;
		else if (value === '') _.unset(target, key);
		else if (value === 'true') target[key] = true;
		else if (value === 'false') target[key] = false;
		else if (!isNaN(value as any)) target[key] = Number.parseFloat(value);
	})
}



export const boolean = {
	is(value: any): value is boolean { return typeof value == 'boolean' },
}



export const string = {
	is(value: any): value is string { return typeof value == 'string' },
	alphanumeric(value: string) {
		return value.replace(/\W+/g, '').trim()
	},
	clean(value: string) {
		return value.replace(/[^a-zA-Z0-9-_. ]/g, ' ').replace(/\s\s+/g, ' ').trim()
	},
	capitalize(value: string) {
		return value.toLowerCase().split(' ').map(word => word[0].toUpperCase() + word.substr(1)).join(' ').trim()
	},
	fuzzysearch(needle: string, haystack: string) {
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
	is(value: any): value is number { return typeof value == 'number' },
	integer(value: string) {
		return Number.parseInt(value.replace(/[^0-9\.]/g, ''))
	},
	float(value: string) {
		return Number.parseFloat(value.replace(/[^0-9\.]/g, ''))
	},
	round(value: number, precision = 0) {
		value = +(Math.round(value + 'e+' + precision as any) + 'e-' + precision)
		return Number.isFinite(value) ? value : 0
	},
	WORDS: {
		0: 'zero', 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six', 7: 'seven', 8: 'eight', 9: 'nine',
		10: 'ten', 11: 'eleven', 12: 'twelve', 13: 'thirteen', 14: 'fourteen', 15: 'fifteen', 16: 'sixteen',
	} as Dict<string>,
	word(value: number) {
		return number.WORDS[value]
	},
}



export const array = {
	is<T = any>(value: any): value is T[] { return Array.isArray(value) },
	create<T = number>(length: number, filled?: T): T[] {
		let alength = arguments.length
		return Array.from(Array(length), function(v, i) {
			if (alength == 1) return i;
			return filled
		}) as any
	},
	chunks<T = any>(value: T[], size: number) {
		if (size == 0) return [value];
		let chunks = Array.from(Array(size), v => []) as T[][]
		value.forEach((v, i) => chunks[i % chunks.length].push(v))
		return chunks
	},
	merge<T = any>(value: T[], source: T[], key: string) {
		source.forEach(function(item, i) {
			let found = value.find(v => v && v[key] == item[key])
			if (found) object.merge(found, item);
			else value.push(item);
		})
	},
	dict<T = string>(value: any[], filled?: T): Dict<T> {
		return value.reduce(function(previous, current, i) {
			previous[current] = filled == null ? current : filled
			return previous
		}, {})
	},
	// dict<T = any>(value: T[], key: string): Dict<T> {
	// 	return value.reduce(function(previous, current, i) {
	// 		previous[current[key]] = current
	// 		return previous
	// 	}, {})
	// },
}

export const sort = {
	alphabetically(a: string, b: string, strict = false) {
		if (strict) {
			a = a.toLowerCase().trim().substring(0, 1)
			b = b.toLowerCase().trim().substring(0, 1)
		}
		if (a < b) return -1;
		if (a > b) return 1;
		return 0
	},
}



export const object = {
	is<T = object>(value: T): value is T { return _.isPlainObject(value) },
	assign<T = object>(target: T, source: T, deep = false) {
		Object.keys(source).forEach(function(key) {
			let tvalue = target[key]
			let svalue = source[key]
			if (deep && object.is(tvalue) && object.is(svalue)) {
				return object.assign(tvalue, svalue, true)
			}
			target[key] = svalue;
		})
	},
	compact<T = object>(target: T, returns = false) {
		Object.keys(target).forEach(function(key) {
			let tvalue = target[key]
			if (tvalue === null || tvalue === undefined) _.unset(target, key);
		})
		if (returns) return target;
	},
	merge<T = object>(target: T, source: T) {
		Object.keys(source).forEach(function(key) {
			let svalue = source[key]
			if (svalue == null) return;
			target[key] = svalue
		})
	},
	repair<T = object>(target: T, source: T) {
		Object.keys(source).forEach(function(key) {
			let value = source[key]
			if (target[key] == null && value != null) target[key] = value;
		})
	},
	nullify<T = object>(target: T) {
		Object.keys(target).forEach(function(key) {
			target[key] = null
		})
	},
}



export const json = {
	is<T = object>(value: T): value is T {
		if (string.is(value)) {
			if (value.charAt(0) == '{') return true;
			if (value.charAt(0) == '[') return true;
		}
		return false
	},
	clone<T = object>(value: T): T {
		return JSON.parse(JSON.stringify(value))
	},
	parse<T = object>(value: T): T {
		return json.is(value) ? JSON.parse(value as any) : value
	},
}



export const math = {
	dispersed(value: number, index: number, max: number) {
		return Math.round(Math.max(index, 0) * (value / Math.max(max, 1)))
	},
	random(min: number, max: number) {
		return Math.floor(Math.random() * (max - min + 1)) + min
	},
}



import { DurationObjectUnits } from 'luxon'
export const time = {
	UNITS: { 'ms': 'milliseconds', 's': 'seconds', 'm': 'minutes', 'h': 'hours' } as Dict<keyof DurationObjectUnits>,
}



// export const promise = {
// 	retry<T = any>(wrapper: Promise<T>): Promise<T> {
// 		return wrapper.then( function () {

// 		} )
// 	},
// }


