// 

import * as _ from 'lodash'



export const string = {
	parseId(input: string) {
		return input.replace(/\W+/g, '').trim()
	},
	clean(input: string) {
		return input.replace(/[^a-zA-Z0-9-_. ]/g, ' ').replace(/\s\s+/g, ' ').trim()
	},
	capitalizeWords(input: string) {
		return input.toLowerCase().split(' ').map(word => word[0].toUpperCase() + word.substr(1)).join(' ').trim()
	},
}



export const array = {
	sortAlphabetically(a: string, b: string) {
		a = a.toLowerCase().trim().substring(0, 1)
		b = b.toLowerCase().trim().substring(0, 1)
		if (a < b) return -1;
		if (a > b) return 1;
		return 0
	},
}



export const object = {
	compact<T = any>(target: T) {
		Object.keys(target).forEach(function(key) {
			if (target[key] == null) _.unset(target, key);
		})
	},
}



export const json = {
	clone<T = any>(input: T): T {
		return JSON.parse(JSON.stringify(input))
	},
}

