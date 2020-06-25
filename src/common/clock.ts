//

import * as schedule from 'node-schedule'
import * as ci from 'correcting-interval'
import * as dayjs from 'dayjs'
import * as core from './core'
import Emitter from './emitter'

enum TICKS {
	// '100ms', '250ms', '500ms',
	'1s',
	'2s',
	'3s',
	'5s',
	'10s',
	'15s',
	'30s',
	'1m',
	'5m',
	'10m',
	'15m',
	'30m',
	'1h',
	'2h',
	'3h',
	'6h',
	'12h',
}
declare global {
	namespace Clock {
		type Tick = keyof typeof TICKS
	}
}

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
function startTick(tick: Clock.Tick, ms: number) {
	const tock = tick
	ci.setCorrectingInterval(function ticking() {
		onTick(tock)
	}, ms)
	onTick(tick)
}

const genesis = clock.ticks.map((tick) => {
	let qty = Number.parseInt(tick)
	let unit = tick.substr(qty.toString().length)
	let ms =
		unit == 'ms'
			? qty
			: dayjs(0)
					.add(qty, unit as any)
					.valueOf()
	let ims = process.env.CLIENT
		? 0
		: core.math.dispersed(ms, +process.env.INSTANCE, +process.env.SCALE)
	let div = process.env.SCALE ? Math.round(ms / +process.env.SCALE) : ms
	return { tick, qty, unit, ms, ims, div }
})

let ready = 0
schedule.scheduleJob('* * * * * *', function onjob(this: schedule.Job, date) {
	if (Date.now() - date.valueOf() > 5 || ready++ < 3) return
	let second = date.getSeconds()
	genesis.remove(({ div, ims, ms, qty, tick, unit }) => {
		if (second % qty) return false
		setTimeout(startTick, ims, tick, ms)
		return true
	})
	if (genesis.length == 0) this.cancel()
})
