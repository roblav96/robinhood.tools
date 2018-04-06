// 

export {
	BehaviorSubject,
	Observable,
	of,
	Subject,
} from 'rxjs'

export {
	filter,
	map,
	mapTo,
	scan,
	take,
} from 'rxjs/operators'

export {
	OperatorFunction,
} from 'rxjs/internal/types'

// 

import * as Rx from './rxjs'



export class ReadySubject {

	private _subject = new Rx.BehaviorSubject(false)

	get value() { return this._subject.value }
	next(value?: boolean) {
		if (typeof value == 'boolean') {
			if (value != this.value) this._subject.next(value);
		} else {
			if (!this._subject.value) this._subject.next(true);
		}
	}

	pipe(toVoid = false) {
		let args = toVoid ? [Rx.mapTo(void 0)] : []
		return this._subject.pipe(Rx.filter(v => !!v), Rx.take(1), ...args)
	}
	toPromise(): Promise<boolean> {
		return this.pipe().toPromise()
	}
	subscribe(next: (value: boolean) => void) {
		return this.pipe().subscribe(next)
	}

}




