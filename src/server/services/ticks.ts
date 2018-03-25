// 

import * as eyes from 'eyes'
import * as _ from 'lodash'
import * as core from '../../common/core'
import * as ci from 'correcting-interval'
import * as ee3 from 'eventemitter3'
import * as utils from './utils'
import * as enums from '../../common/enums'



const EE3 = new ee3.EventEmitter<string, number>()

const ee3ts = {} as { [topic: string]: NodeJS.Timer }
const ee3is = {} as { [topic: string]: number }
function ee3start(topic: string, ms: number) {
	ee3ts[topic].unref(); clearTimeout(ee3ts[topic]); ee3ts[topic] = null; _.unset(ee3ts, topic);
	ee3is[topic] = -1
	// EE3.emit(topic, ee3is[topic])
	ci.setCorrectingInterval(function() {
		ee3is[topic]++
		EE3.emit(topic, ee3is[topic])
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
		let ims = utils.instanceMs(ms)
		let delayms = (start + ims) - now
		if (delayms <= 0) delayms = (end + ims) - now;
		ee3ts[topic] = _.delay(ee3start, delayms, topic, ms) as any
	})
})

export default Object.assign({}, { EE3 }, enums.TICKS)


