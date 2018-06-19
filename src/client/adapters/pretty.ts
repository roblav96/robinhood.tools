// 

export * from '../../common/pretty'
import * as prettyms from 'pretty-ms'
import * as prettybytes from 'pretty-bytes'
import * as humanize from 'humanize-plus'
import * as dayjs from 'dayjs'



declare global { interface NumberFormatOptions { precision: number, price: boolean, compact: boolean, plusminus: boolean, percent: boolean, dollar: boolean, nozeros: boolean } }
export function number(value: number, { precision, price, compact, plusminus, percent, dollar, nozeros } = {} as Partial<NumberFormatOptions>) {
	let abs = Math.abs(value)

	if (price) compact = false;
	if (!Number.isFinite(precision)) {
		precision = 2
		if (plusminus && percent) {
			if (abs >= 100) precision = 0;
			else if (abs >= 10) precision = 1;
		}
		else if (compact) precision = 0;
		else {
			if (compact === undefined && abs >= 10000) compact = true;
			else if (abs >= 1000) precision = 0;
			else if (abs >= 100) precision = 1;
			else if (abs < 2) precision = 3;
		}
	} else { nozeros = false }
	if (plusminus || percent) precision = Math.min(precision, 2);
	if (price) precision = Math.max(precision, 2);

	let unit = -1
	if (compact) {
		while (abs >= 1000) { abs = abs / 1000; unit++ }
	}

	let split = abs.toString().split('.')
	let int = split[0]
	let fixed = int.slice(-3)
	{
		let n: number, i = 1
		for (n = 1000; n <= abs; n *= 1000) {
			let from = i * 3
			i++
			let to = i * 3
			fixed = int.slice(-to, -from) + ',' + fixed
		}
	}

	if (precision > 0 && !(compact && unit == -1)) {
		let end = split[1] || ''
		if (!nozeros || !Number.isNaN(Number.parseInt(end))) {
			fixed += '.'
			let i: number, len = precision
			for (i = 0; i < len; i++) {
				fixed += end[i] || '0'
			}
		}
	}

	if (compact) fixed += ['K', 'M', 'B', 'T'][unit] || '';
	if (value < 0) fixed = '-' + fixed;

	let cash = dollar ? '$' : ''
	if (plusminus && value > 0) {
		fixed = '+' + cash + fixed
	}
	else if (plusminus && value < 0) {
		fixed = '–' + cash + fixed.replace('-', '')
	}
	else { fixed = cash + fixed };
	if (percent) fixed += '%';

	// return fixed == '0.000' ? '0' : fixed
	return fixed
}
if (process.env.DEVELOPMENT) Object.assign(window, { number });



declare global { interface TimeFormatOptions extends prettyms.PrettyMsOptions { max: number, showms: boolean, ago: boolean, keepDecimalsOnWholeSeconds: boolean } }
export function time(stamp: number, opts = {} as Partial<TimeFormatOptions>) {
	opts.secDecimalDigits = opts.secDecimalDigits || 0
	opts.max = opts.max || 1
	let ms = prettyms(Math.max(Date.now() - stamp, opts.showms ? 0 : 1001), opts)
	ms = ms.split(' ').splice(0, opts.verbose ? opts.max * 2 : opts.max).join(' ')
	return opts.ago == false ? ms : ms + ' ago'
}
if (process.env.DEVELOPMENT) Object.assign(window, { time });



export function marketState(state: Hours.State) {
	if (!state) return state;
	if (state == 'REGULAR') return 'Markets Open';
	if (state.includes('PRE')) return 'Pre Market';
	if (state.includes('POST')) return 'After Hours';
	return 'Markets Closed'
}




