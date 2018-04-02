// 

import * as _ from 'lodash'
import * as ci from 'correcting-interval'
import * as core from './core'
import Emitter from './emitter'



const TICKS = {
	'100ms': 100, '250ms': 250, '500ms': 500,
	'1s': 1000, '2s': 2000, '3s': 3000, '5s': 5000,
	'10s': 10000, '15s': 15000, '30s': 30000, '60s': 60000,
}
declare global { type Tick = keyof typeof TICKS }

const emitter = new Emitter<Tick, number>()
export default emitter



const delays = {} as Dict<NodeJS.Timer>
const ages = {} as Dict<number>

function ready(tick: Tick, ms: number) {
	if (process.SERVER) delays[tick].unref();
	clearTimeout(delays[tick]); delays[tick] = null; _.unset(delays, tick);
	ages[tick] = 0
	emitter.emit(tick, ages[tick])
	ci.setCorrectingInterval(function() {
		ages[tick]++
		emitter.emit(tick, ages[tick])
	}, ms)
}

function prepare() {
	Object.keys(TICKS).forEach(function(event, i) {
		let ms = TICKS[event]
		let now = Date.now()
		let start = now - (now % ms)
		let end = start + ms
		let ims = process.CLIENT ? 0 : core.math.dispersed(ms, process.INSTANCE, process.INSTANCES)
		let delay = (start + ims) - now
		if (delay <= 0) delay = (end + ims) - now;
		delays[event] = _.delay(ready, delay, event, ms) as any
	})
}

setImmediate(prepare)




