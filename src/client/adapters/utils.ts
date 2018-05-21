// 

import * as _ from '@/common/lodash'
import * as core from '@/common/core'



const UNITS = ['k', 'M', 'B', 'T']
declare global { interface FormatNumberOpts { precision: number, compact: boolean, plusminus: boolean, percent: boolean, dollar: boolean } }
export function number(value: number, { precision, compact, plusminus, percent, dollar } = {} as Partial<FormatNumberOpts>) {
	if (!Number.isFinite(value)) return value;
	console.log(`value ->`, value)

	if (!Number.isFinite(precision)) {
		if (compact) precision = 0;
		else {
			precision = 2
			let abs = Math.abs(value)
			if (abs >= 10000) precision = 0;
			else if (abs >= 2000) precision = 1;
			else if (abs < 3) precision = 3;
		}
	}
	if (percent || plusminus) precision = Math.min(precision, 2);
	// let fixed = value.toFixed(precision)

	// let int = precision > 0 ? fixed.slice(0, fixed.length - precision - 1) : fixed
	let str = value.toString()
	// let split = value.toString().split('.')
	let int = precision > 0 ? str.slice(0, str.length - precision - 1) : str
	// let end = split[1] ? split[1].slice(0, precision) : '';
	// console.log(`int ->`, int)
	let fixed = int.slice(-3)
	let n: number, i = 1
	for (n = 1000; n < value; n *= 1000) {
		let from = i * 3; i++; let to = i * 3;
		fixed = int.slice(-to, -from) + ',' + fixed
	}
	// console.log(`fixed ->`, fixed)
	// fixed = [int, end].join('.')
	// console.log(`fixed ->`, fixed)

	// let n = 1000
	// let i n = 0
	// while (value >= n) {
	// 	n *= 1000
	// 	i++
	// }

	// if (compact) {
	// 	let units = ['k', 'M', 'B', 'T']
	// 	let split = fixed.split(',')
	// 	if (split.length > 1) {
	// 		let end = Math.max(precision, 0)
	// 		let float = Number.parseFloat(`${split[0]}.${split[1].substring(0, end)}`)
	// 		fixed = `${float}${units[split.length - 2]}`
	// 	}
	// }

	let cash = dollar ? '$' : ''
	if (plusminus && value > 0) {
		fixed = '+' + cash + fixed
	}
	else if (plusminus && value < 0) {
		fixed = fixed.substr(1)
		fixed = '–' + cash + fixed
	}
	else { fixed = cash + fixed };
	if (percent) fixed += '%';

	return fixed
}
if (process.env.DEVELOPMENT) Object.assign(window, { number });



export function marketState(state: Hours.State) {
	if (state == 'REGULAR') return 'Markets Open';
	if (state.includes('PRE')) return 'Pre Market';
	if (state.includes('POST')) return 'After Hours';
	return 'Markets Closed'
}

export function marketcapCategory(marketcap: number) {
	if (marketcap > (100 * 1000 * 1000 * 1000)) return 'mega';
	if (marketcap > (10 * 1000 * 1000 * 1000)) return 'large';
	if (marketcap > (2 * 1000 * 1000 * 1000)) return 'mid';
	if (marketcap > (300 * 1000 * 1000)) return 'small';
	if (marketcap > (50 * 1000 * 1000)) return 'micro';
	return 'nano'
}



export class Tabs {
	components = {} as Dict<any>
	constructor(
		prefix: string,
		public tabs: Partial<UI.Tab>[],
	) {
		tabs.forEach(v => {
			v.title = _.startCase(v.id)
			v.vcomponent = `v-${prefix}-${v.id}`
			this.components[v.vcomponent] = v.component
		})
		this.tabs = core.clone(tabs)
	}
}

declare global {
	namespace UI {
		interface Tab {
			id: string
			title: string
			icon: string
			vcomponent: string
			component: () => any
		}
	}
}


