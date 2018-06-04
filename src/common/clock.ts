// 

import * as ci from 'correcting-interval'
import { defer } from 'lodash'
import { array, math } from './core'
import dayjs from './dayjs'
import Emitter from './emitter'



enum TICKS {
	// '100ms', '250ms', '500ms',
	'1s', '2s', '3s', '5s', '10s', '15s', '30s',
	'1m', '5m', '10m', '15m', '30m',
	'1h', '2h', '3h', '6h', '12h',
}
declare global { namespace Clock { type Tick = keyof typeof TICKS } }



class Clock extends Emitter<Clock.Tick, number> {
	ticks = Object.keys(TICKS).filter(isNaN as any) as Clock.Tick[]
	tocks = array.dict(this.ticks, 0)
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
	let unit = tick.substr(qty.toString().length)
	let ms = unit == 'ms' ? qty : dayjs(0).add(qty, unit as any).valueOf()
	// console.warn('tick ->', tick, '\n', 'qty ->', qty, '\n', 'unit ->', unit, '\n', 'ms ->', ms)
	let now = Date.now()
	let from = now - (now % ms)
	let to = from + ms
	let ims = process.env.CLIENT ? 0 : math.dispersed(ms, +process.env.INSTANCE, +process.env.SCALE)
	let msdelay = (from + ims) - now
	if (msdelay <= 0) msdelay = (to + ims) - now;
	setTimeout(startTicking, msdelay, tick, ms)
}

setTimeout(function clockGenesis() {
	clock.ticks.forEach(tickGenesis)
}, 100 * ((+process.env.INSTANCE || 0) + 1))


