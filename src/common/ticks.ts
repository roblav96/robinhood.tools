// 

import * as _ from 'lodash'
import * as core from './core'
import * as ee4 from './ee4'
import * as enums from './enums'
import * as ci from 'correcting-interval'



const EE4 = new ee4.EventEmitter<string, number>()

const ee4ts = {} as Dict<number & NodeJS.Timer>
const ee4is = {} as Dict<number>
function ee4start(topic: string, ms: number) {
	if (process.SERVER) ee4ts[topic].unref();
	clearTimeout(ee4ts[topic]); ee4ts[topic] = null; _.unset(ee4ts, topic);
	ee4is[topic] = 0
	EE4.emit(topic, ee4is[topic])
	ci.setCorrectingInterval(function() {
		ee4is[topic]++
		EE4.emit(topic, ee4is[topic])
	}, ms)
}

setImmediate(function() {
	Object.keys(enums.TICKS).forEach(function(key, i) {
		let topic = enums.TICKS[key]
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
		ee4ts[topic] = _.delay(ee4start, delayms, topic, ms) as any
	})
})

export default Object.assign(EE4, enums.TICKS)


