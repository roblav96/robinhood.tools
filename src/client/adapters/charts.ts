// 

import * as dayjs from 'dayjs'
import * as prettyms from 'pretty-ms'
import * as echarts from 'echarts'
import * as ecstat from 'echarts-stat'
import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as http from '../../common/http'
import * as webull from '../../common/webull'
import * as yahoo from '../../common/yahoo'
import * as utils from './utils'



export const format = {

	UNITS: { m: 'minute', h: 'hour', d: 'day', wk: 'week', mo: 'month', y: 'year' },
	range(range: string, opts = { plural: false }) {
		if (!range) return range;
		let s = range.replace(/[0-9]/g, '')
		s = format.UNITS[s] || s
		s = s.charAt(0).toUpperCase() + s.substr(1)
		let n = Number.parseInt(range)
		if (!Number.isFinite(n)) return s;
		if (opts.plural && n > 1) s = s + 's';
		return n + ' ' + s
	},

	FRAMES: [
		{ id: 'second', ms: 0, format: 'hh:mm:ssa', ago: true },
		{ id: 'hour', ms: 0, format: 'dddd hh:mm:ssa', ago: true },
		{ id: 'day', ms: 0, format: 'dddd MMM DD, hh:mma', ago: true },
		{ id: 'week', ms: 0, format: 'MMM DD, hh:mma', ago: true },
		{ id: 'month', ms: 0, format: 'MMM DD YYYY, hh:mma' },
		{ id: 'year', ms: 0, format: 'MMM DD YYYY' },
	],
	xlabel(stamp: number) {
		let now = Date.now()
		let i: number, len = format.FRAMES.length
		for (i = 0; i < len; i++) {
			if (stamp > (now - format.FRAMES[i].ms)) {
				let frame = format.FRAMES[i - 1]
				let label = dayjs(stamp).format(frame.format)
				if (frame.format.endsWith('ssa')) {
					if (label.includes(':00')) label = label.replace(':00', '');
				}
				if (frame.format.endsWith('mma')) {
					if (label.includes(', 12:00am')) label = label.replace(', 12:00am', '');
				}
				if (frame.format.startsWith('dddd')) {
					let day = label.split(' ')[0]
					label = label.replace(day, `${day.substring(0, 3)},`)
				}
				if (frame.ago) label += ` (${utils.format.time(stamp)})`
				return label
			}
		}
		return dayjs(stamp).format(format.FRAMES[format.FRAMES.length - 1].format)
	},

}
format.FRAMES.forEach(v => v.ms = dayjs(0).add(1, v.id as any).valueOf())



export const FRAMES = {
	'1d': 'm1',
	'5d': 'm5',
	'1mo': 'm60',
	'3mo': 'd',
	'1y': 'd',
	'5y': 'w',
	'max': 'm',
}
export const RANGES = Object.keys(FRAMES)

export function getChart(symbol: string, tid: number, range: string) {
	return Promise.resolve().then(function() {
		if (range == RANGES[0]) return get1Day(symbol, tid);
		return yahoo.getChart(symbol, { range })
		// let proms = [http.get(`https://quoteapi.webull.com/api/quote/v2/tickerKDatas/${tid}`, {
		// 	query: { kDataType: FRAMES[range] },
		// })]
		// if (range != 'max') proms.push(yahoo.getChart(symbol, { range, interval: '1d' }));
		// return Promise.all(proms).then(function(resolved) {
		// 	let lquotes = webull.toKDatasLives(resolved.shift())
		// 	if (range == 'max') return lquotes;
		// 	let ylquotes = resolved.shift() as Quotes.Live[]

		// 	// let unit = format.UNITS[range.replace(/[0-9]/g, '')]
		// 	// let ms = dayjs(0).add(Number.parseInt(range), unit).valueOf()
		// 	// lquotes.remove(v => v.timestamp < min)
		// 	return lquotes
		// })
	}).then(function(lquotes) {
		lquotes.sort((a, b) => a.timestamp - b.timestamp)
		lquotes.forEach((lquote, i) => {
			lquote.price = lquote.close
			let prev = lquotes[i - 1] ? lquotes[i - 1].volume : lquote.size
			lquote.volume = prev + lquote.size
		})
		return lquotes
	})
}

function get1Day(symbol: string, tid: number) {
	return Promise.all([
		http.get(`https://quoteapi.webull.com/api/quote/v3/tickerMinutes/${tid}/F`, { query: { minuteType: 'm1' } }),
		http.get(`https://quoteapi.webull.com/api/quote/v2/tickerKDatas/${tid}`, { query: { kDataType: 'm1' } }),
		http.get(`https://quoteapi.webull.com/api/quote/v3/tickerMinutes/${tid}/A`, { query: { minuteType: 'm1' } }),
	]).then(function(resolved: Webull.MinuteChart[]) {

		let kdatas = (resolved.splice(1, 1).pop() as any) as Webull.KDatasChart
		kdatas.tickerKDatas.forEach(v => core.fix(v, true))
		let klquotes = webull.toKDatasLives(kdatas)

		resolved.forEach(v => { core.fix(v, true); core.fix(v.data[0], true) })
		let mlquotes = resolved.map(v => webull.toMinutesLives(v)).flatten()
		let mlrange = {
			min: resolved[0].data[0].dates[0].start * 1000,
			max: resolved[1].data[0].dates[0].end * 1000,
		}
		let klrange = {
			min: resolved[0].data[0].dates[0].end * 1000,
			max: resolved[1].data[0].dates[0].start * 1000,
		}
		klquotes.remove(v => v.timestamp < mlrange.min)

		return yahoo.getChart(symbol, {
			interval: '1m',
			includePrePost: true,
			period1: dayjs(mlrange.min).unix(),
			period2: dayjs(mlrange.max).unix(),
		}).then(function(ylquotes) {
			let removed = _.remove(ylquotes, v => v.timestamp > klrange.min && v.timestamp < klrange.max)
			if (removed[0]) core.object.merge(klquotes[0], _.pick(removed[0], ['open', 'high', 'low', 'close']));

			let ystamps = ylquotes.map(v => { v.size = 0; return v.timestamp })
			mlquotes.forEach(mlquote => {
				let ylquote = ylquotes.find(v => v.timestamp == mlquote.timestamp)
				if (ylquote) return ylquote.size += mlquote.size;
				let index = core.array.closest(ystamps, mlquote.timestamp)
				if (index >= 0) ylquotes[index].size += mlquote.size;
			})

			return ylquotes.concat(klquotes)
		})
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
// ])
