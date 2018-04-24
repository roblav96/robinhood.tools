// 

export { Event, Listener } from 'eventemitter3'
import * as EventEmitter3 from 'eventemitter3'
import * as pEvent from 'p-event'



export default class Emitter<Names extends string = string, Data = any> extends EventEmitter3<Names, Data> {

	offListener<Name extends Names>(listener: EventEmitter3.Listener<Data>, context?: any, once?: boolean): this {
		this.eventNames().forEach(name => {
			this.listeners(name).forEach(fn => {
				this.off(name, listener, context, once)
			})
		})
		return this
	}

	offAll<Name extends Names>(name?: Names) {
		return this.removeAllListeners(name)
	}

	toPromise<Name extends Names>(name: Names) {
		return pEvent(this, name)
	}

}


