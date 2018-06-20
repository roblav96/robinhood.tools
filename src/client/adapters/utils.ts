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
		width: window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth || window.screen.width,
		wpixels: 0,
		height: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight || window.screen.height,
		hpixels: 0,
	}
	screen.wpixels = window.devicePixelRatio * screen.width
	screen.hpixels = window.devicePixelRatio * screen.height
	return screen
}

// export const mousepos = { x: 0, y: 0 }
// window.addEventListener('pointermove', raf((event: PointerEvent) => {
// 	mousepos.x = event.x
// 	mousepos.y = event.y
// }), { passive: true })



export function raf(fn: (...args) => void) {
	let wait = false
	return function(...args) {
		if (wait) return;
		fn.apply(null, args)
		wait = true
		window.requestAnimationFrame(() => wait = false)
	}
}



// let wevents = ['blur', 'click', 'dblclick', 'ended', 'error', 'focus', 'keydown', 'keypress', 'keyup', 'load', 'readystatechange', 'resize', 'scroll', 'suspend', 'unload', 'wheel'] as (keyof WindowEventMap)[]
class UEmitter extends Emitter<keyof WindowEventMap, Event> {
	private static PASSIVES = ['mousedown', 'mouseenter', 'mouseleave', 'mousemove', 'mouseout', 'mouseover', 'mouseup', 'mousewheel', 'resize', 'scroll', 'touchend', 'touchenter', 'touchleave', 'touchmove', 'touchstart', 'wheel'] as (keyof WindowEventMap)[]
	private subs = [] as string[]
	get emitter() { return global[this.ctor] as WindowEventHandlers }
	constructor(private ctor: string) {
		super()
		return proxy.observe(this, key => {
			let subs = Object.keys(this._events)
			if (JSON.stringify(this.subs) === JSON.stringify(subs)) return;
			_.difference(subs, this.subs).forEach(name => {
				if (UEmitter.PASSIVES.includes(name as any)) {
					this.emitter.addEventListener(name, this, { passive: true, capture: false })
				} else this.emitter.addEventListener(name, this, false)
			})
			_.difference(this.subs, subs).forEach(name => this.emitter.removeEventListener(name, this, false))
			this.subs = subs
		})
	}
	handleEvent(event: Event) { this.emit(event.type as any, event) }
}
export const wemitter = new UEmitter('window')
// export const docemitter = new UEmitter('document')



export function bidask(quote: Quotes.Quote) {
	let bidask = { bid: { price: 0, size: 0 }, ask: { price: 0, size: 0 } }
	if (Object.keys(quote).length == 0) return bidask;
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



export function marketcapCategory(marketcap: number) {
	if (marketcap > (100 * 1000 * 1000 * 1000)) return 'mega';
	if (marketcap > (10 * 1000 * 1000 * 1000)) return 'large';
	if (marketcap > (2 * 1000 * 1000 * 1000)) return 'mid';
	if (marketcap > (300 * 1000 * 1000)) return 'small';
	if (marketcap > (50 * 1000 * 1000)) return 'micro';
	return 'nano'
}




