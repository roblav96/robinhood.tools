// 

import * as schedule from 'node-schedule'
import * as ci from 'correcting-interval'
import * as _ from './lodash'
import * as core from './core'
import dayjs from './dayjs'
import Emitter from './emitter'



enum TICKS {
	// '100ms', '250ms', '500ms',
	'1s', '2s', '3s', '5s', '10s', '15s', '30s', '60s',
	// '1m', '5m', '10m', '15m', '30m',
	// '1h', '2h', '3h', '6h', '12h',
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

const waiting = clock.ticks.map(tick => {
	let qty = Number.parseInt(tick)
	let unit = tick.substr(Number.parseInt(tick).toString().length)
	let ms = unit == 'ms' ? qty : dayjs(0).add(qty, unit as any).valueOf()
	let ims = process.env.CLIENT ? 0 : core.math.dispersed(ms, +process.env.INSTANCE, +process.env.SCALE)
	return { tick, qty, unit, ms, ims }
})

schedule.scheduleJob('* * * * * *', function onjob(this: schedule.Job, date) {
	let drift = Date.now() - date.valueOf()
	if (drift > 5) return;
	let second = date.getSeconds()
	waiting.remove(wait => {
		if (second % wait.qty) return false;
		let drift = Date.now() - date.valueOf()
		if (drift > 5) return false;
		wait.ims == 0 ? startTicking(wait.tick, wait.ms) : setTimeout(startTicking, wait.ims, wait.tick, wait.ms)
		return true
	})
	if (waiting.length == 0) this.cancel();
})



// if (LOG) {
// 	clock.on('60s', function(i) {
// 		console.log(`60s ->`, i)
// 	})
// }





// const geneses = [
// 	{ unit: 's', rule: '* * * * * *' },
// 	{ unit: 'm', rule: '0 * * * * *' },
// 	{ unit: 'h', rule: '0 0 * * * *' },
// ]
// const sTicks = clock.ticks.filter(v => v.endsWith('s'))

// function tickGenesis(tick: Clock.Tick) {
// 	let qty = Number.parseInt(tick)
// 	let unit = tick.substr(qty.toString().length)
// 	let ms = unit == 'ms' ? qty : dayjs(0).add(qty, unit as any).valueOf()
// 	// if (process.env.PRIMARY) console.log('tick ->', tick, '\n', 'qty ->', qty, '\n', 'unit ->', unit, '\n', 'ms ->', ms)
// 	// let now = Date.now()
// 	// let from = now - (now % ms)
// 	// let to = from + ms
// 	let ims = process.env.CLIENT ? 0 : core.math.dispersed(ms, +process.env.INSTANCE, +process.env.SCALE)
// 	if (LOG) {
// 		console.log(`Date.now() - then ->`, Date.now() - then)
// 		// console.log('ims ->', ims)
// 	}
// 	// let msdelay = (from + ims) - now
// 	// if (msdelay <= 0) msdelay = (to + ims) - now;
// 	setTimeout(startTicking, ims, tick, ms)
// }

// setTimeout(function clockGenesis() {
// 	// clock.ticks.forEach(tickGenesis)
// 	clock.ticks.forEach(function(tick, i) {
// 		setTimeout(tickGenesis, i * 100, tick)
// 	})
// }, 3000)


