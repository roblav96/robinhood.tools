// 

import * as _ from 'lodash'
import * as ci from 'correcting-interval'
import * as core from './core'
import Emitter from './emitter'



const TICKS = {
	t100ms: 100, t250ms: 250, t500ms: 500,
	t1s: 1000, t2s: 2000, t3s: 3000, t5s: 5000,
	t10s: 10000, t15s: 15000, t30s: 30000, t60s: 60000,
}
const emitter = new Emitter<keyof typeof TICKS>()

const ee4ts = {} as Dict<number>
const ee4is = {} as Dict<number>
function ee4start(topic: string, ms: number) {
	if (process.SERVER) (ee4ts[topic] as any).unref();
	clearTimeout(ee4ts[topic]); ee4ts[topic] = null; _.unset(ee4ts, topic);
	const tick = topic as any
	ee4is[tick] = 0
	emitter.emit(tick, ee4is[tick])
	ci.setCorrectingInterval(function() {
		ee4is[tick]++
		emitter.emit(tick, ee4is[tick])
	}, ms)
}

setImmediate(function() {
	Object.keys(TICKS).forEach(function(event, i) {
		let ms = TICKS[event] as number
		let now = Date.now()
		let start = now - (now % ms)
		let end = start + ms
		let ims = process.CLIENT ? 0 : core.math.dispersed(ms, process.INSTANCE, process.INSTANCES)
		console.log('ims ->', ims)
		let delay = (start + ims) - now
		if (delay <= 0) delay = (end + ims) - now;
		ee4ts[event] = _.delay(ee4start, delay, event, ms)
	})
})

export default Object.assign(emitter, TICKS)


