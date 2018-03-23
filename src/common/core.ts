// 

import * as _ from 'lodash'



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

