// 

import * as dayjs from 'dayjs'
import * as prettyms from 'pretty-ms'
import * as echarts from 'echarts'
import * as ecstat from 'echarts-stat'
import * as _ from '../../common/lodash'
import * as core from '../../common/core'
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


