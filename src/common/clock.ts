// 

import { Duration } from 'luxon'
import * as _ from 'lodash'
import * as ci from 'correcting-interval'
import * as core from './core'
import Emitter from './emitter'



enum TICKS {
	// '100ms', 
	'250ms',
	// '500ms',
	'1s', '2s', '3s', '5s', '10s', '15s', '30s',
	'1m', '5m', '10m', '15m', '30m',
	'1h', '2h', '3h', '6h', '12h',
}
declare global { namespace Clock { type Tick = keyof typeof TICKS } }



class Clock extends Emitter<Clock.Tick, number> {
	ticks = Object.keys(TICKS).filter(isNaN as any) as Clock.Tick[]
	tocks = core.array.dict(this.ticks, 0)
}

const clock = new Clock()
export default clock



function onTick(tick: Clock.Tick) {
	clock.tocks[tick]++
	clock.emit(tick, clock.tocks[tick])
}

function startTicking(tick: Clock.Tick, ms: number) {
	onTick(tick)
	const tock = tick
	ci.setCorrectingInterval(function tickingInterval() {
		onTick(tock)
	}, ms)
}

function tickGenesis(tick: Clock.Tick) {
	let qty = Number.parseInt(tick)
	let unit = core.time.UNITS[tick.substr(qty.toString().length)]
	let ms = Duration.fromObject({ [unit]: qty }).as('milliseconds')
	// console.warn('tick ->', console.dump(tick), '\n', 'qty ->', console.dump(qty), '\n', 'unit ->', console.dump(unit), '\n', 'ms ->', console.dump(ms))
	let now = Date.now()
	let from = now - (now % ms)
	let to = from + ms
	let ims = process.CLIENT ? 0 : core.math.dispersed(ms, process.INSTANCE, process.INSTANCES)
	let delay = (from + ims) - now
	if (delay <= 0) delay = (to + ims) - now;
	_.delay(startTicking, delay, tick, ms)
}

setImmediate(function clockGenesis() {
	clock.ticks.forEach(tickGenesis)
})


