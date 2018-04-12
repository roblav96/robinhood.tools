// 

import * as Bluebird from 'bluebird'
Bluebird.config({ warnings: { wForgottenReturn: false } })

import * as _ from './lodash'
import * as leven from 'leven'



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
		else if (value === '') delete target[key];
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
	stopwords: ['a', 'able', 'about', 'above', 'abroad', 'according', 'accordingly', 'across', 'actually', 'adj', 'after', 'afterwards', 'again', 'against', 'ago', 'ahead', 'aint', 'all', 'allow', 'allows', 'almost', 'alone', 'along', 'alongside', 'already', 'also', 'although', 'always', 'am', 'amid', 'amidst', 'among', 'amongst', 'an', 'and', 'another', 'any', 'anybody', 'anyhow', 'anyone', 'anything', 'anyway', 'anyways', 'anywhere', 'apart', 'appear', 'appreciate', 'appropriate', 'are', 'arent', 'around', 'as', 'as', 'aside', 'ask', 'asking', 'associated', 'at', 'available', 'away', 'awfully', 'b', 'back', 'backward', 'backwards', 'be', 'became', 'because', 'become', 'becomes', 'becoming', 'been', 'before', 'beforehand', 'begin', 'behind', 'being', 'believe', 'below', 'beside', 'besides', 'best', 'better', 'between', 'beyond', 'both', 'brief', 'but', 'by', 'c', 'came', 'can', 'cannot', 'cant', 'cant', 'caption', 'cause', 'causes', 'certain', 'certainly', 'changes', 'clearly', 'cmon', 'co', 'co.', 'com', 'come', 'comes', 'concerning', 'consequently', 'consider', 'considering', 'contain', 'containing', 'contains', 'corresponding', 'could', 'couldnt', 'course', 'cs', 'currently', 'd', 'dare', 'darent', 'definitely', 'described', 'despite', 'did', 'didnt', 'different', 'directly', 'do', 'does', 'doesnt', 'doing', 'done', 'dont', 'down', 'downwards', 'during', 'e', 'each', 'edu', 'eg', 'eight', 'eighty', 'either', 'else', 'elsewhere', 'end', 'ending', 'enough', 'entirely', 'especially', 'et', 'etc', 'even', 'ever', 'evermore', 'every', 'everybody', 'everyone', 'everything', 'everywhere', 'ex', 'exactly', 'example', 'except', 'f', 'fairly', 'far', 'farther', 'few', 'fewer', 'fifth', 'first', 'five', 'followed', 'following', 'follows', 'for', 'forever', 'former', 'formerly', 'forth', 'forward', 'found', 'four', 'from', 'further', 'furthermore', 'g', 'get', 'gets', 'getting', 'given', 'gives', 'go', 'goes', 'going', 'gone', 'got', 'gotten', 'greetings', 'h', 'had', 'hadnt', 'half', 'happens', 'hardly', 'has', 'hasnt', 'have', 'havent', 'having', 'he', 'hed', 'hell', 'hello', 'help', 'hence', 'her', 'here', 'hereafter', 'hereby', 'herein', 'heres', 'hereupon', 'hers', 'herself', 'hes', 'hi', 'him', 'himself', 'his', 'hither', 'hopefully', 'how', 'howbeit', 'however', 'hundred', 'i', 'id', 'ie', 'if', 'ignored', 'ill', 'im', 'immediate', 'in', 'inasmuch', 'inc', 'inc.', 'indeed', 'indicate', 'indicated', 'indicates', 'inner', 'inside', 'insofar', 'instead', 'into', 'inward', 'is', 'isnt', 'it', 'itd', 'itll', 'its', 'its', 'itself', 'ive', 'j', 'just', 'k', 'keep', 'keeps', 'kept', 'know', 'known', 'knows', 'l', 'last', 'lately', 'later', 'latter', 'latterly', 'least', 'less', 'lest', 'let', 'lets', 'like', 'liked', 'likely', 'likewise', 'little', 'look', 'looking', 'looks', 'low', 'lower', 'ltd', 'm', 'made', 'mainly', 'make', 'makes', 'many', 'may', 'maybe', 'maynt', 'me', 'mean', 'meantime', 'meanwhile', 'merely', 'might', 'mightnt', 'mine', 'minus', 'miss', 'more', 'moreover', 'most', 'mostly', 'mr', 'mrs', 'much', 'must', 'mustnt', 'my', 'myself', 'n', 'name', 'namely', 'nd', 'near', 'nearly', 'necessary', 'need', 'neednt', 'needs', 'neither', 'never', 'neverf', 'neverless', 'nevertheless', 'new', 'next', 'nine', 'ninety', 'no', 'nobody', 'non', 'none', 'nonetheless', 'noone', 'no-one', 'nor', 'normally', 'not', 'nothing', 'notwithstanding', 'novel', 'now', 'nowhere', 'o', 'obviously', 'of', 'off', 'often', 'oh', 'ok', 'okay', 'old', 'on', 'once', 'one', 'ones', 'ones', 'only', 'onto', 'opposite', 'or', 'other', 'others', 'otherwise', 'ought', 'oughtnt', 'our', 'ours', 'ourselves', 'out', 'outside', 'over', 'overall', 'own', 'p', 'particular', 'particularly', 'past', 'per', 'perhaps', 'placed', 'please', 'plus', 'possible', 'presumably', 'probably', 'provided', 'provides', 'q', 'que', 'quite', 'qv', 'r', 'rather', 'rd', 're', 'really', 'reasonably', 'recent', 'recently', 'regarding', 'regardless', 'regards', 'relatively', 'respectively', 'right', 'round', 's', 'said', 'same', 'saw', 'say', 'saying', 'says', 'second', 'secondly', 'see', 'seeing', 'seem', 'seemed', 'seeming', 'seems', 'seen', 'self', 'selves', 'sensible', 'sent', 'serious', 'seriously', 'seven', 'several', 'shall', 'shant', 'she', 'shed', 'shell', 'shes', 'should', 'shouldnt', 'since', 'six', 'so', 'some', 'somebody', 'someday', 'somehow', 'someone', 'something', 'sometime', 'sometimes', 'somewhat', 'somewhere', 'soon', 'sorry', 'specified', 'specify', 'specifying', 'still', 'sub', 'such', 'sup', 'sure', 't', 'take', 'taken', 'taking', 'tell', 'tends', 'th', 'than', 'thank', 'thanks', 'thanx', 'that', 'thatll', 'thats', 'thats', 'thatve', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'thence', 'there', 'thereafter', 'thereby', 'thered', 'therefore', 'therein', 'therell', 'therere', 'theres', 'theres', 'thereupon', 'thereve', 'these', 'they', 'theyd', 'theyll', 'theyre', 'theyve', 'thing', 'things', 'think', 'third', 'thirty', 'this', 'thorough', 'thoroughly', 'those', 'though', 'three', 'through', 'throughout', 'thru', 'thus', 'till', 'to', 'together', 'too', 'took', 'toward', 'towards', 'tried', 'tries', 'truly', 'try', 'trying', 'ts', 'twice', 'two', 'u', 'un', 'under', 'underneath', 'undoing', 'unfortunately', 'unless', 'unlike', 'unlikely', 'until', 'unto', 'up', 'upon', 'upwards', 'us', 'use', 'used', 'useful', 'uses', 'using', 'usually', 'v', 'value', 'various', 'versus', 'very', 'via', 'viz', 'vs', 'w', 'want', 'wants', 'was', 'wasnt', 'way', 'we', 'wed', 'welcome', 'well', 'well', 'went', 'were', 'were', 'werent', 'weve', 'what', 'whatever', 'whatll', 'whats', 'whatve', 'when', 'whence', 'whenever', 'where', 'whereafter', 'whereas', 'whereby', 'wherein', 'wheres', 'whereupon', 'wherever', 'whether', 'which', 'whichever', 'while', 'whilst', 'whither', 'who', 'whod', 'whoever', 'whole', 'wholl', 'whom', 'whomever', 'whos', 'whose', 'why', 'will', 'willing', 'wish', 'with', 'within', 'without', 'wonder', 'wont', 'would', 'wouldnt', 'x', 'y', 'yes', 'yet', 'you', 'youd', 'youll', 'your', 'youre', 'yours', 'yourself', 'yourselves', 'youve', 'z', 'zero'],
	minify(value: string) {
		value = value.replace(/[^a-zA-Z ]/g, ' ').replace(/\s\s+/g, ' ').toLowerCase().trim()
		return value.split(' ').filter(v => string.stopwords.indexOf(v) == -1).join(' ').trim()
	},
	tags(value: string, input = [] as string[]) {
		let tags = string.minify(value).split(' ')
		input.forEach(v => tags.push(...string.minify(v).split(' ')))
		return _.uniq(_.compact(tags)).filter(v => v && v.length > 2 && string.stopwords.indexOf(v) == -1)
	},
	id(value: string) {
		return string.hash(string.minify(value).replace(/\s/g, '').trim())
	},
	hash(value: string) {
		value = value.toString()
		let hash = 0, i, chr
		if (value.length === 0) return hash.toString();
		for (i = 0; i < value.length; i++) {
			chr = value.charCodeAt(i)
			hash = ((hash << 5) - hash) + chr
			hash |= 0
		}
		return Math.abs(hash).toString()
	},
	alphanumeric(value: string) {
		return value.replace(/\W+/g, '').trim()
	},
	clean(value: string) {
		return value.replace(/[^a-zA-Z0-9-_. ]/g, ' ').replace(/\s\s+/g, ' ').trim()
	},
	capitalize(value: string) {
		return value.toLowerCase().split(' ').map(word => word[0].toUpperCase() + word.substr(1)).join(' ').trim()
	},
	leven(a: string, b: string) {
		return leven(a, b) as number
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
	// pick<T>(target: T, keys?: KeysOf<T>): T { return _.pick(target, keys) as any },
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



import * as R from './rambdax'
export function pRetry<T>(fn: Promise<T>) {
	console.warn('pRetryss')
	console.log('fn ->', fn)
	console.log('arguments ->', arguments)
	// console.log('fn ->', console.dump(fn, { depth: 8 }))
	return fn.get(0 as any).then(function(idk) {
		console.log('idk ->', idk)
	}).catch((error) => {
		// console.log('this ->', this)
		console.error('pRetry Error ->', error)
		return R.delay(1000).then(function(delay) {
			console.log('delay ->', console.inspect(delay))
			// return fn()
		})
	})
}

// export class PromiseRetry {

// 	private static get options() {
// 		return _.clone({
// 			times: Infinity,
// 			tick: '3s' as Clock.Tick,
// 		})
// 	}

// 	constructor(
// 		promise: Promise<any>,
// 		options = {} as Partial<typeof PromiseRetry.options>,
// 	) {
// 		console.log('arguments ->', console.inspect(arguments))
// 		return promise.catch(function(error) {
// 			console.error('PromiseRetry Error ->', error)
// 			// return promise.call(...arguments)
// 		})
// 	}

// }



// export const promise = {
// 	retry<T = any>(wrapper: Promise<T>): Promise<T> {
// 		return wrapper.then( function () {

// 		} )
// 	},
// }


