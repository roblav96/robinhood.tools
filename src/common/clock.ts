// 

import * as schedule from 'node-schedule'
import * as NanoTimer from 'nanotimer'
import * as ci from 'correcting-interval'
import * as _ from './lodash'
import * as core from './core'
import dayjs from './dayjs'
import Emitter from './emitter'



const LOG = process.env.NAME == 'stocks'

enum TICKS {
	// '100ms', '250ms', '500ms',
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
function startTick(tick: Clock.Tick, ms: number, timer?: NanoTimer) {
	const tock = tick
	ci.setCorrectingInterval(function ticking() { onTick(tock) }, ms)
	onTick(tick)
	if (timer) timer.clearTimeout();
}

const geneses = clock.ticks.map(tick => {
	let qty = Number.parseInt(tick)
	let unit = tick.substr(qty.toString().length)
	let ms = unit == 'ms' ? qty : dayjs(0).add(qty, unit as any).valueOf()
	let ims = process.env.CLIENT ? 0 : core.math.dispersed(ms, +process.env.INSTANCE, +process.env.SCALE)
	let div = process.env.SCALE ? Math.round(ms / +process.env.SCALE) : ms
	return { tick, qty, unit, ms, ims, div }
})

let ready = 0
schedule.scheduleJob('* * * * * *', function onjob(this: schedule.Job, date) {
	if (Date.now() - date.valueOf() > 5 || ready++ < 3) return;
	let second = date.getSeconds()
	// let drifts = []
	geneses.remove(({ div, ims, ms, qty, tick, unit }) => {
		if (second % qty) return false;
		// if (unit.endsWith('s')) {
		// 	let timer = new NanoTimer()
		// 	timer.setTimeout(startTick, [tick, ms, timer], `${ims}m`)
		// } else {
		setTimeout(startTick, ims, tick, ms)
		// }
		// let drift = Date.now() - date.valueOf()
		// drifts.push({ div, drift, ims, ms, qty, tick, unit })
		return true
	})
	// if (LOG) console.log(`drifts ->`, drifts);
	if (geneses.length == 0) this.cancel();
})





// schedule.scheduleJob('* * * * * *', function onjob(this: schedule.Job, date) {
// 	let drift = Date.now() - date.valueOf()
// 	if (drift > 5) return;
// 	let second = date.getSeconds()
// 	let now = date.valueOf()
// 	let drifts = []
// 	geneses.forEach(({ ims, ms, qty, tick, unit }) => {
// 		let from = now - (now % ms)
// 		let to = from + ms
// 		let delay = (from + ims) - now
// 		if (delay <= 0) delay = (to + ims) - now;
// 		let timer = new NanoTimer()
// 		timer.setTimeout(startTick, [tick, ms, timer], `${delay}m`)
// 		drift = Date.now() - date.valueOf()
// 		drifts.push({ drift, delay, ims, ms, qty, tick, unit })
// 	})
// 	if (LOG) {
// 		console.log(`drifts ->`, drifts)
// 	}
// 	this.cancel()
// })

// if (LOG && process.env.PRIMARY) {
// 	let then = new Date()
// 	console.log('then ->', then)
// 	let date = dayjs(then).add(3, 'second').toDate()
// 	schedule.scheduleJob(date, function onjob(this: schedule.Job, date) {
// 		let drift = Date.now() - date.valueOf()
// 		console.log(`drift ->`, drift)
// 	})
// }





// clock.on('1s', function (i) {
// 	console.log(`1s ->`, i)
// })



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
// 	setTimeout(startTick, ims, tick, ms)
// }

// setTimeout(function clockGenesis() {
// 	// clock.ticks.forEach(tickGenesis)
// 	clock.ticks.forEach(function(tick, i) {
// 		setTimeout(tickGenesis, i * 100, tick)
// 	})
// }, 3000)


