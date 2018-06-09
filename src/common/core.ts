// 

import * as _ from './lodash'
import * as leven from 'leven'
import * as dayjs from 'dayjs'
dayjs.extend(require('dayjs/plugin/relativeTime'))



export const HOSTNAME = process.env.DOMAIN.split('.').slice(-2).join('.')

export function noop() { }

export function isJunk(value: any) {
	if (value == null) return true;
	if (string.is(value) && value === '') return true;
	if (number.is(value) && !Number.isFinite(value)) return true;
	return false
}
// export function isTruthy(value: any) { return !isFalsey(value) }

export const isBrowser = !new Function('try { return this === global; } catch(e) { return false }')()
export const isNodeJS = !isBrowser



const FIXDATE = ['created_at', 'timestamp', 'updated_at']
const FIXURL = ['account', 'ach_relationship', 'instrument', 'watchlist']
export function fix(target: any, deep?: any) {
	Object.keys(target).forEach(key => {
		let value = target[key]
		if (value == null) return;
		else if (key == 'symbol') return;
		else if (deep === true && Array.isArray(value)) return value.forEach(v => fix(v));
		else if (deep === true && object.is(value)) return fix(value);
		else if (!string.is(value)) return;
		else if (value === '') delete target[key];
		else if (!isNaN(key as any)) return;
		else if (!isNaN(value as any)) target[key] = Number.parseFloat(value);
		else if (value === 'NaN') target[key] = NaN;
		else if (value === 'null') target[key] = null;
		else if (value === 'undefined') target[key] = undefined;
		else if (value === 'true') target[key] = true;
		else if (value === 'false') target[key] = false;
		else if (json.is(value)) target[key] = JSON.parse(value);
		else if (FIXDATE.includes(key)) target[key] = new Date(value).valueOf();
		else if (value.includes('.robinhood.com') && FIXURL.includes(key)) {
			target[key] = value.split('/').splice(-2, 1)[0]
		}
	})
}

export function clone<T extends object = object>(target: T): T {
	return JSON.parse(JSON.stringify(target))
}

export function nullify(value: any) {
	if (array.is(value)) {
		value.splice(0)
	} else if (object.is(value)) {
		Object.keys(value).forEach(k => {
			let v = value[k]
			if (array.is(v)) {
				v.splice(0)
			} else if (object.is(v)) {
				value[k] = {}
			} else {
				value[k] = null
			}
		})
	}
}

export function fallback<T>(...values: T[]): T {
	return _.compact(values)[0]
}



export const calc = {
	percent(to: number, from: number) {
		if (from == 0) return 0;
		return ((to - from) / from) * 100
	},
	slider(value: number, min: number, max: number) {
		if ((max - min) == 0) return 0;
		return ((value - min) / (max - min)) * 100
	},
}



export const boolean = {
	is(value: any): value is boolean { return typeof value == 'boolean' },
}



// const STOP_WORDS = ['a', 'able', 'about', 'above', 'abroad', 'according', 'accordingly', 'across', 'actually', 'adj', 'after', 'afterwards', 'again', 'against', 'ago', 'ahead', 'aint', 'all', 'allow', 'allows', 'almost', 'alone', 'along', 'alongside', 'already', 'also', 'although', 'always', 'am', 'amid', 'amidst', 'among', 'amongst', 'an', 'and', 'another', 'any', 'anybody', 'anyhow', 'anyone', 'anything', 'anyway', 'anyways', 'anywhere', 'apart', 'appear', 'appreciate', 'appropriate', 'are', 'arent', 'around', 'as', 'as', 'aside', 'ask', 'asking', 'associated', 'at', 'available', 'away', 'awfully', 'b', 'back', 'backward', 'backwards', 'be', 'became', 'because', 'become', 'becomes', 'becoming', 'been', 'before', 'beforehand', 'begin', 'behind', 'being', 'believe', 'below', 'beside', 'besides', 'best', 'better', 'between', 'beyond', 'both', 'brief', 'but', 'by', 'c', 'came', 'can', 'cannot', 'cant', 'cant', 'caption', 'cause', 'causes', 'certain', 'certainly', 'changes', 'clearly', 'cmon', 'co', 'co.', 'com', 'come', 'comes', 'concerning', 'consequently', 'consider', 'considering', 'contain', 'containing', 'contains', 'corresponding', 'could', 'couldnt', 'course', 'cs', 'currently', 'd', 'dare', 'darent', 'definitely', 'described', 'despite', 'did', 'didnt', 'different', 'directly', 'do', 'does', 'doesnt', 'doing', 'done', 'dont', 'down', 'downwards', 'during', 'e', 'each', 'edu', 'eg', 'eight', 'eighty', 'either', 'else', 'elsewhere', 'end', 'ending', 'enough', 'entirely', 'especially', 'et', 'etc', 'even', 'ever', 'evermore', 'every', 'everybody', 'everyone', 'everything', 'everywhere', 'ex', 'exactly', 'example', 'except', 'f', 'fairly', 'far', 'farther', 'few', 'fewer', 'fifth', 'first', 'five', 'followed', 'following', 'follows', 'for', 'forever', 'former', 'formerly', 'forth', 'forward', 'found', 'four', 'from', 'further', 'furthermore', 'g', 'get', 'gets', 'getting', 'given', 'gives', 'go', 'goes', 'going', 'gone', 'got', 'gotten', 'greetings', 'h', 'had', 'hadnt', 'half', 'happens', 'hardly', 'has', 'hasnt', 'have', 'havent', 'having', 'he', 'hed', 'hell', 'hello', 'help', 'hence', 'her', 'here', 'hereafter', 'hereby', 'herein', 'heres', 'hereupon', 'hers', 'herself', 'hes', 'hi', 'him', 'himself', 'his', 'hither', 'hopefully', 'how', 'howbeit', 'however', 'hundred', 'i', 'id', 'ie', 'if', 'ignored', 'ill', 'im', 'immediate', 'in', 'inasmuch', 'inc', 'inc.', 'indeed', 'indicate', 'indicated', 'indicates', 'inner', 'inside', 'insofar', 'instead', 'into', 'inward', 'is', 'isnt', 'it', 'itd', 'itll', 'its', 'its', 'itself', 'ive', 'j', 'just', 'k', 'keep', 'keeps', 'kept', 'know', 'known', 'knows', 'l', 'last', 'lately', 'later', 'latter', 'latterly', 'least', 'less', 'lest', 'let', 'lets', 'like', 'liked', 'likely', 'likewise', 'little', 'look', 'looking', 'looks', 'low', 'lower', 'ltd', 'm', 'made', 'mainly', 'make', 'makes', 'many', 'may', 'maybe', 'maynt', 'me', 'mean', 'meantime', 'meanwhile', 'merely', 'might', 'mightnt', 'mine', 'minus', 'miss', 'more', 'moreover', 'most', 'mostly', 'mr', 'mrs', 'much', 'must', 'mustnt', 'my', 'myself', 'n', 'name', 'namely', 'nd', 'near', 'nearly', 'necessary', 'need', 'neednt', 'needs', 'neither', 'never', 'neverf', 'neverless', 'nevertheless', 'new', 'next', 'nine', 'ninety', 'no', 'nobody', 'non', 'none', 'nonetheless', 'noone', 'no-one', 'nor', 'normally', 'not', 'nothing', 'notwithstanding', 'novel', 'now', 'nowhere', 'o', 'obviously', 'of', 'off', 'often', 'oh', 'ok', 'okay', 'old', 'on', 'once', 'one', 'ones', 'ones', 'only', 'onto', 'opposite', 'or', 'other', 'others', 'otherwise', 'ought', 'oughtnt', 'our', 'ours', 'ourselves', 'out', 'outside', 'over', 'overall', 'own', 'p', 'particular', 'particularly', 'past', 'per', 'perhaps', 'placed', 'please', 'plus', 'possible', 'presumably', 'probably', 'provided', 'provides', 'q', 'que', 'quite', 'qv', 'r', 'rather', 'rd', 're', 'really', 'reasonably', 'recent', 'recently', 'regarding', 'regardless', 'regards', 'relatively', 'respectively', 'right', 'round', 's', 'said', 'same', 'saw', 'say', 'saying', 'says', 'second', 'secondly', 'see', 'seeing', 'seem', 'seemed', 'seeming', 'seems', 'seen', 'self', 'selves', 'sensible', 'sent', 'serious', 'seriously', 'seven', 'several', 'shall', 'shant', 'she', 'shed', 'shell', 'shes', 'should', 'shouldnt', 'since', 'six', 'so', 'some', 'somebody', 'someday', 'somehow', 'someone', 'something', 'sometime', 'sometimes', 'somewhat', 'somewhere', 'soon', 'sorry', 'specified', 'specify', 'specifying', 'still', 'sub', 'such', 'sup', 'sure', 't', 'take', 'taken', 'taking', 'tell', 'tends', 'th', 'than', 'thank', 'thanks', 'thanx', 'that', 'thatll', 'thats', 'thats', 'thatve', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'thence', 'there', 'thereafter', 'thereby', 'thered', 'therefore', 'therein', 'therell', 'therere', 'theres', 'theres', 'thereupon', 'thereve', 'these', 'they', 'theyd', 'theyll', 'theyre', 'theyve', 'thing', 'things', 'think', 'third', 'thirty', 'this', 'thorough', 'thoroughly', 'those', 'though', 'three', 'through', 'throughout', 'thru', 'thus', 'till', 'to', 'together', 'too', 'took', 'toward', 'towards', 'tried', 'tries', 'truly', 'try', 'trying', 'ts', 'twice', 'two', 'u', 'un', 'under', 'underneath', 'undoing', 'unfortunately', 'unless', 'unlike', 'unlikely', 'until', 'unto', 'up', 'upon', 'upwards', 'us', 'use', 'used', 'useful', 'uses', 'using', 'usually', 'v', 'value', 'various', 'versus', 'very', 'via', 'viz', 'vs', 'w', 'want', 'wants', 'was', 'wasnt', 'way', 'we', 'wed', 'welcome', 'well', 'well', 'went', 'were', 'were', 'werent', 'weve', 'what', 'whatever', 'whatll', 'whats', 'whatve', 'when', 'whence', 'whenever', 'where', 'whereafter', 'whereas', 'whereby', 'wherein', 'wheres', 'whereupon', 'wherever', 'whether', 'which', 'whichever', 'while', 'whilst', 'whither', 'who', 'whod', 'whoever', 'whole', 'wholl', 'whom', 'whomever', 'whos', 'whose', 'why', 'will', 'willing', 'wish', 'with', 'within', 'without', 'wonder', 'wont', 'would', 'wouldnt', 'x', 'y', 'yes', 'yet', 'you', 'youd', 'youll', 'your', 'youre', 'yours', 'yourself', 'yourselves', 'youve', 'z', 'zero']
const STOP_WORDS = ['about', 'after', 'all', 'also', 'am', 'an', 'and', 'another', 'any', 'are', 'as', 'at', 'be', 'because', 'been', 'before', 'being', 'between', 'both', 'but', 'by', 'came', 'can', 'come', 'could', 'did', 'do', 'each', 'for', 'from', 'get', 'got', 'has', 'had', 'he', 'have', 'her', 'here', 'him', 'himself', 'his', 'how', 'if', 'in', 'into', 'is', 'it', 'like', 'make', 'many', 'me', 'might', 'more', 'most', 'much', 'must', 'my', 'never', 'now', 'of', 'on', 'only', 'or', 'other', 'our', 'out', 'over', 'said', 'same', 'see', 'should', 'since', 'some', 'still', 'such', 'take', 'than', 'that', 'the', 'their', 'them', 'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too', 'under', 'up', 'very', 'was', 'way', 'we', 'well', 'were', 'what', 'where', 'which', 'while', 'who', 'with', 'would', 'you', 'your', 'a', 'i']
export const string = {
	is(value: any): value is string { return typeof value == 'string' },
	insert(a: string, b: string, position: number) {
		return a.substr(0, position) + b + a.substr(position)
	},
	minify(value: string) {
		if (!value) return value;
		value = value.replace(/[^a-zA-Z ]/g, ' ').replace(/\s\s+/g, ' ').toLowerCase().trim()
		return value.split(' ').filter(v => STOP_WORDS.indexOf(v) == -1).join(' ').trim()
	},
	tags(value: string, input = [] as string[]) {
		if (!value) return value;
		let tags = string.minify(value).split(' ')
		input.forEach(v => tags.push(...string.minify(v).split(' ')))
		return _.uniq(_.compact(tags)).filter(v => v && v.length > 2 && STOP_WORDS.indexOf(v) == -1)
	},
	id(value: string) {
		if (!value) return value;
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
		if (!value) return value;
		return value.replace(/\W+/g, '').trim()
	},
	clean(value: string) {
		if (!value) return value;
		return value.replace(/[^a-zA-Z0-9-_. ]/g, '').replace(/\s\s+/g, ' ').trim()
	},
	capitalize(value: string) {
		if (!value) return value;
		return value.trim().replace(/\s\s+/g, ' ').toLowerCase().split(' ').map(word => word[0].toUpperCase() + word.substr(1)).join(' ').trim()
	},
	leven(a: string, b: string) {
		return leven(a, b) as number
	},
	fuzzysearch(value: string, search: string) {
		let hlen = value.length
		let nlen = search.length
		if (nlen > hlen) return false;
		if (nlen === hlen) return search === value;
		outer: for (let i = 0, j = 0; i < nlen; i++) {
			let nch = search.charCodeAt(i)
			while (j < hlen) {
				if (value.charCodeAt(j++) === nch) {
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
	isFinite(value: any): value is number { return Number.isFinite(value) },
	parseInt(value: string) {
		return Number.parseInt(value.replace(/[^0-9\.]/g, ''))
	},
	parseFloat(value: string) {
		return Number.parseFloat(value.replace(/[^0-9\.]/g, ''))
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
	merge<T = any>(target: T[], source: T[], primary: string, deep = false) {
		source.forEach(function(item, i) {
			let found = target.find(v => v && v[primary] == item[primary])
			if (found) object.assign(found, item, deep);
			else target.push(item);
		})
	},
	dict<T = string>(value: any[], filled?: T): Dict<T> {
		return value.reduce(function(previous, current, i) {
			previous[current] = filled == null ? current : filled
			return previous
		}, {})
	},
	closest(value: number[], find: number, favor = 'min' as 'min' | 'max') {
		let index = value.map(n => Math.abs(n - find))
		let near = Math[favor].apply(Math, index)
		return index.indexOf(near)
	},
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
	// is<T = object>(value: T): value is T { return _.isPlainObject(value) },
	is<T = object>(value: T): value is T { return value && typeof value == 'object' && value.constructor == Object },
	assign<T = object>(target: T, source: T, deep = false) {
		Object.keys(source).forEach(function assignEach(key) {
			let tvalue = target[key]
			let svalue = source[key]
			if (deep && object.is(tvalue) && object.is(svalue)) {
				return object.assign(tvalue, svalue, deep)
			}
			target[key] = svalue;
		})
	},
	filter<T = object>(target: T, fn: (value: any, key: string) => boolean) {
		let keys = Object.keys(target)
		let i: number, len = keys.length
		for (i = 0; i < len; i++) {
			let key = keys[i]
			let value = target[key]
			if (fn(value, key)) {
				delete target[key]
			}
		}
	},
	clean<T = object>(target: T) {
		let keys = Object.keys(target)
		let i: number, len = keys.length
		for (i = 0; i < len; i++) {
			let key = keys[i]
			let value = target[key]
			if (value == null || (number.is(value) && !number.isFinite(value))) {
				delete target[key]
			}
		}
	},
	merge<T = object>(target: T, source: T, keys?: string[]) {
		keys = keys || Object.keys(source)
		if (keys.length == 0) return;
		let i: number, len = keys.length
		for (i = 0; i < len; i++) {
			let key = keys[i]
			let value = source[key]
			if (value != null) {
				target[key] = value
			}
		}
	},
	mergeAll<T = object>(targets: T[], source: T, keys?: string[]) {
		keys = keys || Object.keys(source)
		if (keys.length == 0) return;
		let size = targets.length
		let i: number, len = keys.length
		for (i = 0; i < len; i++) {
			let key = keys[i]
			let value = source[key]
			if (value != null) {
				let ii: number, lenn = size
				for (ii = 0; ii < lenn; ii++) {
					targets[ii][key] = value
				}
			}
		}
	},
	repair<T = object>(target: T, source: T) {
		let keys = Object.keys(source)
		let i: number, len = keys.length
		for (i = 0; i < len; i++) {
			let key = keys[i]
			let tvalue = target[key]
			let svalue = source[key]
			if (tvalue == null && svalue != null) {
				target[key] = svalue
			}
		}
	},
	difference<T = object>(from: any, to: T) {
		let diff = {} as T
		let keys = Object.keys(to)
		if (keys.length == 0) return diff;
		let i: number, len = keys.length
		for (i = 0; i < len; i++) {
			let key = keys[i]
			let value = to[key]
			if (from[key] != value) {
				diff[key] = value
			}
		}
		return diff
	},
	sortKeys<T = object>(target: T): T {
		return _.fromPairs(_.sortBy(_.toPairs(target as any))) as any
	},
	// empty<T = object>(target: T) {
	// 	Object.keys(target).forEach(function(key) {
	// 		let value = target[key]
	// 	})
	// },
}



export const json = {
	is<T = object>(value: T) {
		if (string.is(value)) {
			if (value.charAt(0) == '{') return true;
			if (value.charAt(0) == '[') return true;
		}
		return false
	},
	parse<T = object>(value: T): T {
		return json.is(value) ? JSON.parse(value as any) : value
	},
}



export const math = {
	clamp(n: number, a: number, b: number) {
		return Math.min(Math.max(n, a), b)
	},
	dispersed(value: number, index: number, max: number, method = 'round' as keyof Math) {
		return Math[method as any](Math.max(index, 0) * (value / Math.max(max, 1)))
	},
	random(min: number, max: number) {
		if (!Number.isFinite(max)) { max = min; min = 0 }
		return Math.floor(Math.random() * (max - min + 1)) + min
	},
	round(value: number, precision?: number) {
		if (!Number.isFinite(precision)) return Math.round(value);
		return +(Math.round(value + 'e+' + precision as any) + 'e-' + precision)
	},
	max(a = -Infinity, b = -Infinity, c = -Infinity) {
		return Math.max(a, b, c)
	},
	min(a = Infinity, b = Infinity, c = Infinity) {
		return Math.min(a, b, c)
	},
	sum(a = 0, b = 0, c = 0) {
		return a + b + c
	},
	sum0(a = 0, b = 0, c = 0) {
		return Math.max(a + b + c, 0)
	},
}



export const promise = {
	delay(ms: number) { return new Promise<void>(r => setTimeout(r, ms)) },
}


