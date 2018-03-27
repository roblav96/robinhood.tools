// 

import * as ee3 from 'eventemitter3'



export class EventEmitter<E = string, D = any> extends ee3.EventEmitter<E, D> {
	removeListenerFunction(fn: (...args: D[]) => void, context?: any, once?: boolean) {
		this.eventNames().forEach(event => {
			this.listeners(event).forEach(listener => {
				if (fn == listener) {
					this.removeListener(event, fn, context, once)
				}
			})
		})
		return this
	}
	offFunction(fn: (...args: D[]) => void, context?: any, once?: boolean) {
		return this.removeListenerFunction(fn, context, once)
	}
}

declare global {
	export namespace ee3 {
		export interface EventEmitter<E = string, D = any> {
			removeListenerFunction(fn: (...args: D[]) => void, context?: any, once?: boolean): this
			offFunction(fn: (...args: D[]) => void, context?: any, once?: boolean): this
		}
	}
}


