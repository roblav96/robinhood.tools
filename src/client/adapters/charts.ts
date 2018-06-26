// 

import * as dayjs from 'dayjs'
import * as echarts from 'echarts'
import * as ecstat from 'echarts-stat'
import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as http from '../../common/http'
import * as webull from '../../common/webull'
import * as yahoo from '../../common/yahoo'
import * as utils from './utils'
import * as pretty from './pretty'



const XLABEL_FRAMES = [
	{ id: 'millisecond', ms: 0, format: 'h:mm:ssa', ago: true },
	{ id: 'hour', ms: 0, format: 'h:mm:ssa', ago: true },
	{ id: 'day', ms: 0, format: 'dddd, MMM D, h:mm:ssa', ago: true },
	{ id: 'week', ms: 0, format: 'MMM D, h:mma', ago: true },
	{ id: 'month', ms: 0, format: 'MMM D YYYY, h:mma' },
	{ id: 'year', ms: 0, format: 'MMM D YYYY' },
]
XLABEL_FRAMES.forEach(v => v.ms = dayjs(0).add(1, v.id as any).valueOf())
export function xlabel(stamp: number) {
	if (!Number.isFinite(stamp)) return '';
	let now = Date.now()
	let i: number, len = XLABEL_FRAMES.length
	for (i = 0; i < len; i++) {
		if (stamp > (now - XLABEL_FRAMES[i].ms)) {
			let ii = Math.max(i - 1, 0)
			let frame = XLABEL_FRAMES[ii]
			let label = dayjs(stamp).format(frame.format)
			if (frame.format.endsWith('ssa')) {
				if (label.includes(':00')) label = label.replace(':00', '');
			}
			if (frame.format.endsWith('mma')) {
				if (label.includes(', 9:30am')) label = label.replace(', 9:30am', '');
				if (label.includes(', 12:00am')) label = label.replace(', 12:00am', '');
			}
			if (frame.format.startsWith('dddd')) {
				let day = label.split(' ')[0]
				label = label.replace(day, `${day.substring(0, 3)},`)
			}
			if (frame.ago) {
				label += ` (${pretty.time(stamp)})`
			}
			if (!frame.ago) {
				if (label.includes(', 9:30am')) label = label.replace(', 9:30am', '');
			}
			return label
		}
	}
	return dayjs(stamp).format(XLABEL_FRAMES[XLABEL_FRAMES.length - 1].format)
}

const RANGE_UNITS = { m: 'minute', h: 'hour', d: 'day', wk: 'week', mo: 'month', y: 'year', ytd: 'YTD' }
export function range(range: string, opts = { plural: true }) {
	if (!range) return range;
	let s = range.replace(/[0-9]/g, '')
	s = RANGE_UNITS[s] || s
	s = s.charAt(0).toUpperCase() + s.substr(1)
	let n = Number.parseInt(range)
	if (!Number.isFinite(n)) return s;
	if (opts.plural && n > 1) s = s + 's';
	return n + ' ' + s
}



export function tipFormatter(params: echarts.EventParam<Quotes.Live>[], option: echarts.Option) {
	// console.log('params ->', params)
	let html = ''
	params.forEach((param, i) => {
		// console.log(`param.value ->`, param.value)
		let trs = `<td class="font-semibold pr-1"><i class="mdi mdi-circle" style="color: ${param.color};"></i> ${param.seriesName}</td>`
		let tooltip = option.series[param.seriesIndex].encode.tooltip
		if (Array.isArray(tooltip)) {
			tooltip.forEach((key: string) => {
				let value = pretty.number(param.value[key], { price: true, nozeros: true })
				trs += `<td class="pr-1">${_.startCase(key)}</td><td class="text-right">${value}&nbsp;&nbsp;</td>`
			})
		} else {
			let value = pretty.number(param.value[tooltip], { nozeros: true })
			trs += `<td class="text-right">${value}</td>`
		}
		let hr = i < params.length - 1 ? `<hr class="my-1 has-background-grey-darker">` : ''
		html += `<table class="m-0 w-full"><tbody><tr>${trs}</tr></tbody></table>${hr}`
	})
	return `<div class="font-sans leading-tight has-background-dark has-text-white p-1 rounded">${html}</div>`
}



export function getChart(quote: Quotes.Quote, range: string) {
	return Promise.resolve().then(function() {

		let symbol = quote.symbol
		if (quote.typeof == 'INDEXES') symbol = encodeURI('^' + symbol);
		if (quote.typeof == 'FOREX') symbol = symbol + '=X';
		if (range != yahoo.RANGES[0] || quote.typeof != 'STOCKS') {
			return yahoo.getChart(symbol, {
				range, interval: yahoo.FRAMES[range],
				includePrePost: range == yahoo.RANGES[1],
			})
		}

		return Promise.all([
			http.get(`https://quoteapi.webull.com/api/quote/v3/tickerMinutes/${quote.tickerId}/F`, { query: { minuteType: 'm1' } }).catch(_.noop),
			http.get(`https://quoteapi.webull.com/api/quote/v3/tickerMinutes/${quote.tickerId}/A`, { query: { minuteType: 'm1' } }).catch(_.noop),
			http.get(`https://quoteapi.webull.com/api/quote/v4/tickerKDatas/${quote.tickerId}`, { query: { kDataType: 'm1', dayCount: 1, adjustType: 'none' } }).catch(_.noop),
		]).then(function(mquotes: Webull.MinuteChart[]) {
			console.log(`mquotes ->`, JSON.parse(JSON.stringify(mquotes)))

			let kquotes = (mquotes.pop() as any) as Webull.KDatasChart
			core.fix(kquotes, true)
			let klquotes = webull.toKDatasLives(kquotes)

			mquotes.forEach(v => core.fix(v.data[0], true))
			let mlquotes = mquotes.map(v => webull.toMinutesLives(v)).flatten()

			let mrange = {
				min: dayjs(Math.min(...mquotes.map(v => v.data[0].dates[0].start * 1000))).valueOf(),
				max: dayjs(Math.max(...mquotes.map(v => v.data[0].dates[0].end * 1000))).valueOf(),
			}
			console.log(`mrange ->`, _.mapValues(mrange, v => pretty.stamp(v)))
			klquotes.remove(v => v.timestamp < mrange.min)

			return yahoo.getChart(symbol, {
				interval: '1m', includePrePost: true,
				period1: dayjs(mrange.min).startOf('hour').unix(),
				period2: dayjs(mrange.max).endOf('hour').unix(),
			}).then(function(ylquotes) {

				mlquotes.forEach(mlquote => {
					let ylquote = ylquotes.find(v => v.timestamp == mlquote.timestamp)
					if (!ylquote) return;
					let wick = Math.abs(ylquote.high - ylquote.low)
					let bar = Math.abs(ylquote.open - ylquote.close)
					let percent = core.calc.percent(wick, bar)
					if (percent > 15000) return;
					core.object.merge(mlquote, core.object.pick(ylquote, ['open', 'high', 'low']))
				})

				let ylquote = ylquotes.find(v => v.timestamp >= klquotes[0].timestamp)
				if (ylquote) core.object.merge(klquotes[0], core.object.pick(ylquote, ['open', 'high', 'low']));

				return mlquotes.concat(klquotes).sort((a, b) => a.timestamp - b.timestamp)
			})
		})

	}).then(function(lquotes) {
		lquotes.forEach((lquote, i) => {
			let prev = lquotes[i - 1] ? lquotes[i - 1].volume : lquote.size
			lquote.volume = prev + lquote.size
		})
		return lquotes
	})
}





// export function getMinutes(tid: number, range: string) {
// 	return Promise.resolve().then(function() {
// 		let proms = []
// 		if (range == '1d') {
// 			let query = { minuteType: 'm1' }
// 			proms.push(http.get(`https://quoteapi.webull.com/api/quote/v3/tickerMinutes/${tid}/F`, { query }))
// 			proms.push(http.get(`https://quoteapi.webull.com/api/quote/v2/tickerMinutes/${tid}`, { query }))
// 			proms.push(http.get(`https://quoteapi.webull.com/api/quote/v3/tickerMinutes/${tid}/A`, { query }))
// 		}
// 		if (range == '5d') {
// 			let query = { minuteType: 'm5' }
// 			proms.push(http.get(`https://quoteapi.webull.com/api/quote/v2/tickerMinutes/${tid}`, { query }))
// 		}
// 		return Promise.all(proms)
// 	}).then(function(resolved: Webull.MinuteChart[]) {
// 		let lquotes = [] as Quotes.Live[]
// 		resolved.forEach(response => {
// 			response.data.forEach(data => {
// 				data.tickerMinutes.forEach(minute => {
// 					let msplit = minute.split(',').map(Number.parseFloat)
// 					lquotes.push({
// 						price: msplit[1], size: msplit[2],
// 						timestamp: msplit[0] * 1000,
// 					} as Quotes.Live)
// 				})
// 			})
// 		})
// 		lquotes.sort((a, b) => a.timestamp - b.timestamp)
// 		// lquotes.forEach((lquote, i) => {
// 		// 	lquote.price = lquote.close
// 		// 	let prev = lquotes[i - 1] ? lquotes[i - 1].volume : lquote.size
// 		// 	lquote.volume = prev + lquote.size
// 		// })
// 		return lquotes
// 	})
// }



// import * as benchmark from '../../common/benchmark'
// benchmark.simple('formats', [
// 	function formattime() {
// 		prettyms(Date.now() - (Math.round(Math.random() * 1000000)))
// 	},
// 	function fromnowdayjs() {
// 		dayjs(Date.now() - (Math.round(Math.random() * 1000000))).fromNow()
// 	},
// 	function formatdayjs() {
// 		dayjs(Date.now() - (Math.round(Math.random() * 1000000))).format('dddd, MMM DD YYYY, hh:mm:ssa')
// 	},
// 	function xlabel() {
// 		format.xlabel(Date.now() - (Math.round(Math.random() * 1000000)))
// 	},
// ])


