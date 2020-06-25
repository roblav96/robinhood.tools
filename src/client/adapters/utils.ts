//

import * as dayjs from 'dayjs'
import * as prettyms from 'pretty-ms'
import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as proxy from '../../common/proxy'
import Emitter from '../../common/emitter'
import clock from '../../common/clock'

export function screen() {
	let screen = {
		width:
			window.innerWidth ||
			document.documentElement.clientWidth ||
			document.body.clientWidth ||
			window.screen.width,
		pxwidth: 0,
		height:
			window.innerHeight ||
			document.documentElement.clientHeight ||
			document.body.clientHeight ||
			window.screen.height,
		pxheight: 0,
	}
	screen.pxwidth = window.devicePixelRatio * screen.width
	screen.pxheight = window.devicePixelRatio * screen.height
	return screen
}

// export const mousepos = { x: 0, y: 0 }
// window.addEventListener('pointermove', raf((event: PointerEvent) => {
// 	mousepos.x = event.x
// 	mousepos.y = event.y
// }), { passive: true })

// let traf = raf(function(args) {
// 	console.warn(`traf args ->`, args)
// })
// let i = 0
// let ti = setInterval(() => {
// 	i++
// 	if (i > 25) clearInterval(ti);
// 	console.log(`traf(${i})`)
// 	traf(i)
// }, 1)
export function raf(fn: (...args) => void) {
	let waiting = false
	let theargs = null
	return function (...args) {
		theargs = args
		if (waiting) return
		waiting = true
		window.requestAnimationFrame(() => {
			fn.apply(null, theargs)
			waiting = false
		})
	}
}

// let wevents = ['blur', 'click', 'dblclick', 'ended', 'error', 'focus', 'keydown', 'keypress', 'keyup', 'load', 'readystatechange', 'resize', 'scroll', 'suspend', 'unload', 'wheel'] as (keyof WindowEventMap)[]
class EventListener extends Emitter<keyof WindowEventMap, Event> {
	private static PASSIVES = [
		'mousedown',
		'mouseenter',
		'mouseleave',
		'mousemove',
		'mouseout',
		'mouseover',
		'mouseup',
		'mousewheel',
		'resize',
		'scroll',
		'touchend',
		'touchenter',
		'touchleave',
		'touchmove',
		'touchstart',
		'wheel',
	] as (keyof WindowEventMap)[]
	private subs = [] as string[]
	get emitter() {
		return global[this.ctor] as WindowEventHandlers
	}
	constructor(private ctor: string) {
		super()
		return proxy.observe(this, (key) => {
			let subs = Object.keys(this._events)
			if (JSON.stringify(this.subs) === JSON.stringify(subs)) return
			_.difference(subs, this.subs).forEach((name) => {
				if (EventListener.PASSIVES.includes(name as any)) {
					this.emitter.addEventListener(name, this, { passive: true })
				} else this.emitter.addEventListener(name, this)
			})
			_.difference(this.subs, subs).forEach((name) =>
				this.emitter.removeEventListener(name, this),
			)
			this.subs = subs
		})
	}
	handleEvent(event: Event) {
		this.emit(event.type as any, event)
	}
}
export const wemitter = new EventListener('window')

export function bidask(quote: Quotes.Quote) {
	let bidask = { bid: { price: 0, size: 0 }, ask: { price: 0, size: 0 } }
	if (Object.keys(quote).length == 0) return bidask
	{
		let max = quote.ask - quote.bid
		bidask.bid.price = core.calc.slider(quote.price - quote.bid, 0, max)
		bidask.ask.price = core.calc.slider(quote.ask - quote.price, 0, max)
	}
	{
		let max = quote.bids + quote.asks
		bidask.bid.size = core.calc.slider(quote.bids, 0, max)
		bidask.ask.size = core.calc.slider(quote.asks, 0, max)
	}
	return bidask
}

export function randomPrice(price: number) {
	return _.round(price + _.random(-1, 1, true), 2)
}

export function marketCap(value: number) {
	let category = { i: 1, text: 'nano' }
	if (value > 200 * 1000 * 1000 * 1000) category = { i: 6, text: 'mega' }
	else if (value > 10 * 1000 * 1000 * 1000) category = { i: 5, text: 'large' }
	else if (value > 2 * 1000 * 1000 * 1000) category = { i: 4, text: 'mid' }
	else if (value > 300 * 1000 * 1000) category = { i: 3, text: 'small' }
	else if (value > 50 * 1000 * 1000) category = { i: 2, text: 'micro' }
	return category
}
