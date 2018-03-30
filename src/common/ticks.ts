// 

import * as _ from 'lodash'
import * as core from './core'
import * as ee4 from './ee4'
import * as ci from 'correcting-interval'



const TICKS = {
	T01: 'tick:01', T025: 'tick:025', T05: 'tick:05',
	T1: 'tick:1', T2: 'tick:2', T3: 'tick:3', T5: 'tick:5',
	T10: 'tick:10', T15: 'tick:15', T30: 'tick:30', T60: 'tick:60',
}
const EE4 = new ee4.EventEmitter<string, number>()



const ee4ts = {} as Dict<number>
const ee4is = {} as Dict<number>
function ee4start(topic: string, ms: number) {
	if (process.SERVER) (ee4ts[topic] as any).unref();
	clearTimeout(ee4ts[topic]); ee4ts[topic] = null; _.unset(ee4ts, topic);
	ee4is[topic] = 0
	EE4.emit(topic, ee4is[topic])
	ci.setCorrectingInterval(function() {
		ee4is[topic]++
		EE4.emit(topic, ee4is[topic])
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

export default Object.assign(EE4, TICKS)


