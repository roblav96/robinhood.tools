// 

import * as _ from 'lodash'
import * as ci from 'correcting-interval'
import * as core from './core'
import Emitter from './emitter'



const TICKS = {
	t100ms: '100', t250ms: '250', t500ms: '500',
	t1s: '1000', t2s: '2000', t3s: '3000', t5s: '5000',
	t10s: '10000', t15s: '15000', t30s: '30000', t60s: '60000',
}
const emitter = new Emitter<keyof typeof TICKS, number>()



const delays = {} as Dict<number>
const tprog = {} as Dict<number>
function ee4start(event: string, ms: number) {
	if (process.SERVER) (delays[event] as any).unref();
	clearTimeout(delays[event]); delays[event] = null; _.unset(delays, event);
	tprog[event] = 0
	emitter.emit(event as any, tprog[event])
	ci.setCorrectingInterval(function() {
		tprog[event]++
		emitter.emit(event as any, tprog[event])
	}, ms)
}

setImmediate(function() {
	Object.keys(TICKS).forEach(function(event, i) {
		let ms = Number.parseInt(TICKS[event])
		TICKS[event] = event
		let now = Date.now()
		let start = now - (now % ms)
		let end = start + ms
		let ims = process.CLIENT ? 0 : core.math.dispersed(ms, process.INSTANCE, process.INSTANCES)
		let delay = (start + ims) - now
		if (delay <= 0) delay = (end + ims) - now;
		delays[event] = _.delay(ee4start, delay, event, ms)
	})
})

export default Object.assign(emitter, TICKS)


