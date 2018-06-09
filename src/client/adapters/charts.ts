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



const frames = [
	{ id: 'hour', ms: 0, utils: true },
	{ id: 'day', ms: 0, format: 'h:mm:ssa' },
	{ id: 'week', ms: 0, format: 'dddd, h:mm:ssa' },
	{ id: 'month', ms: 0, format: 'MMM DD' },
	{ id: 'quarter', ms: 0, format: 'MMM DD' },
	{ id: 'year', ms: 0, format: 'MMM DD YYYY' },
]
frames.forEach(v => v.ms = dayjs(0).add(1, v.id as any).valueOf())

let midnight = dayjs().startOf('day').valueOf()
export function xformat(value: number) {
	let now = Date.now()
	let i: number, len = frames.length
	for (i = 0; i < len; i++) {
		let frame = frames[i]
		if (value > (now - frame.ms)) {
			if (frame.utils) {
				return utils.format.time(value, { verbose: true })
			}
			let day = dayjs(value).format(frame.format)
			if (frame.format.endsWith('ssa') && day.includes(':00')) {
				day = day.replace(':00', '')
			}
			return day
		}
	}
	return dayjs(value).format(frames[frames.length - 1].format)
}



export function getChart(symbol: string, tid: number, range: string) {
	if (range == yahoo.RANGES[0]) return get1Day(symbol, tid);
	return []
}

function get1Day(symbol: string, tid: number) {
	let query = { minuteType: 'm1' }
	return Promise.all([
		http.get(`https://quoteapi.webull.com/api/quote/v3/tickerMinutes/${tid}/F`, { query }),
		http.get(`https://quoteapi.webull.com/api/quote/v3/tickerMinutes/${tid}/A`, { query }),
	]).then(function(resolved: Webull.MinuteChart[]) {
		let wlquotes = resolved.map(v => webull.parseMinuteLives(v)).flatten()
		let tstamps = wlquotes.map(v => v.timestamp)
		return yahoo.getChart(symbol, {
			interval: '1m',
			includePrePost: true,
			period1: dayjs(Math.min(...tstamps)).unix(),
			period2: dayjs(Math.max(...tstamps)).unix(),
		}).then(function(lquotes) {
			// console.log(`wlquotes ->`, JSON.parse(JSON.stringify(wlquotes)))
			// console.log(`lquotes ->`, JSON.parse(JSON.stringify(lquotes)))
			lquotes.forEach(lquote => {
				let wlquote = wlquotes.find(v => v.timestamp == lquote.timestamp)
				if (wlquote) return lquote.size += wlquote.size;
			})
			// wlquotes.forEach(wlquote => {
			// 	wlquote.high = 15
			// 	wlquote.low = 5
			// 	lquotes.push(wlquote)
			// })
			lquotes.sort((a, b) => a.timestamp - b.timestamp)
			lquotes.forEach((lquote, i) => {
				lquote.price = lquote.close
				let prev = lquotes[i - 1] ? lquotes[i - 1].volume : lquote.size
				lquote.volume = prev + lquote.size
			})
			console.log(`lquotes ->`, JSON.parse(JSON.stringify(lquotes)))
			return lquotes
		})
	})
	// return getMinutes(tid, yahoo.RANGES[0]).then(function(lquotes) {

	// })
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
// 	function formatnumber() {
// 		fromnow(Date.now() - (Math.round(Math.random() * 1000000)))
// 	},
// 	function formatdayjs() {
// 		dayjs(Date.now() - (Math.round(Math.random() * 1000000))).format('dddd, MMM DD YYYY, hh:mm:ssa')
// 	},
// ])


