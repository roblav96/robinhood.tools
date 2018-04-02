// 

import * as _ from 'lodash'
import * as luxon from 'luxon'
import * as ci from 'correcting-interval'
import * as Rolex from 'rolex'
import * as core from './core'
import * as Rx from './rxjs'
import Emitter from './emitter'



enum TICKS {
	// '100ms', '250ms', '500ms',
	'1s', '2s', '3s', '5s', '10s', '15s', '30s',
	'1m', '5m', '10m', '15m', '30m',
	'1h', '2h', '3h', '6h', '12h',
}
declare global { namespace Clock { type Tick = keyof typeof TICKS } }

const ticks = Object.keys(TICKS).filter(isNaN as any)
const tocks = core.array.dict(ticks, 0)



// // const clock = new Rx.Subject<Clock.Tick>()
const clock = new Rx.Subject<Clock.Tick>()
// // const clock = Rx.of({ message : 'Logged in' })
// // export default clock

// // clock.pipe(
// // 	Rx.scan(function (tick) {
// // 		return tick
// // 	})
// // )

// // let clock$ = clock.pipe(
// // 	Rx.map(tick => state => Object.assign({}, state, { count: state.count + 1 }))
// // )



function onTock(tick: Clock.Tick) {
	console.log('onTock tick ->', tick)
	clock.next(tick)
}

function tockGenesis(tick: Clock.Tick, ms: number) {
	console.warn('tockGenesis tick ->', tick)
	Rolex.setInterval(onTock, ms, tick)
}

function tickGenesis(tick: string) {
	let qty = Number.parseInt(tick)
	let unit = core.time.UNITS[tick.substr(qty.toString().length)]
	let ms = luxon.Duration.fromObject({ [unit]: qty }).as('milliseconds')
	// console.warn('tick ->', console.dump(tick), '\n', 'qty ->', console.dump(qty), '\n', 'unit ->', console.dump(unit), '\n', 'ms ->', console.dump(ms))
	let now = Date.now()
	let from = now - (now % ms)
	let to = from + ms
	let ims = process.CLIENT ? 0 : core.math.dispersed(ms, process.INSTANCE, process.INSTANCES)
	let delay = (from + ims) - now
	if (delay <= 0) delay = (to + ims) - now;
	Rolex.setTimeout(tockGenesis, delay, tick, ms)
	// ████████████████████████████████████████████████████████████████████████
	//       Rolex.setTimeout(Rolex.setInterval, delay, onTock, ms, tick)
	// ████████████████████████████████████████████████████████████████████████
}

function clockGenesis() { ticks.forEach(tickGenesis) }
setImmediate(clockGenesis)





// function onTock(tick: Clock.Tick) {
// 	tocks[tick]++
// 	clock.next(tick)
// }
// function startTicking(tick: Clock.Tick, ms: number) {
// 	onTock(tick)
// 	const tock = tick
// 	ci.setCorrectingInterval(function tickInterval() {
// 		onTock(tock)
// 	}, ms)
// }
// const emitter = new Emitter()
// export default emitter


