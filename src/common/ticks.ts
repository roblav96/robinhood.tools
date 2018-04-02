// 

import * as _ from 'lodash'
import * as ci from 'correcting-interval'
import * as core from './core'
import Emitter from './emitter'



const TICKS = {
	t01: 'tick:01', t025: 'tick:025', t05: 'tick:05',
	t1: 'tick:1', t2: 'tick:2', t3: 'tick:3', t5: 'tick:5',
	t10: 'tick:10', t15: 'tick:15', t30: 'tick:30', t60: 'tick:60',
}
// const emitter = new Emitter<keyof typeof TICKS>()
const emitter = new Emitter()



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
	Object.keys(TICKS).forEach(function(key, i) {
		let topic = TICKS[key]
		if (!core.string.is(topic)) return;
		let tick = Number.parseInt(key.split('T').pop())
		if (key == 'T01') tick = 0.1;
		if (key == 'T025') tick = 0.25;
		if (key == 'T05') tick = 0.5;
		let ms = tick * 1000
		let now = Date.now()
		let start = now - (now % ms)
		let end = start + ms
		let ims = process.CLIENT ? 0 : core.math.dispersed(ms, process.INSTANCE, process.INSTANCES)
		let delayms = (start + ims) - now
		if (delayms <= 0) delayms = (end + ims) - now;
		ee4ts[topic] = _.delay(ee4start, delayms, topic, ms)
	})
})

export default Object.assign(emitter, TICKS)


