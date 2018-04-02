// 

import * as _ from 'lodash'
import * as ee3 from 'eventemitter3'



export default class Emitter<E = string, D = any> extends ee3.EventEmitter<E, D> {

	handlerEvents(handler: ee3.Listener<D>, context?: any, once?: boolean) {
		let events = [] as ee3.HandlerEvent<E, D>[]
		this.eventNames().forEach(event => {
			this.listeners(event).forEach(listener => {
				if (handler == listener) {
					events.push({ event, listener })
				}
			})
		})
		return events
	}

	removeHandler(handler: ee3.Listener<D>, context?: any, once?: boolean) {
		this.handlerEvents(handler).forEach(hevent => {
			this.removeListener(hevent.event, hevent.listener, context, once)
		})
		return this
	}
	offHandler(handler: ee3.Listener<D>, context?: any, once?: boolean) {
		return this.removeHandler(handler, context, once)
	}

}


