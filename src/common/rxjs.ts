// 

export {
	Subject,
	BehaviorSubject,
} from 'rxjs'

export {
	filter,
	take,
	mapTo,
} from 'rxjs/operators'

// 

import * as Rx from './rxjs'



export class ReadySubject {
	private _subject = new Rx.BehaviorSubject(false)
	get value() { return this._subject.value }
	next(ready: boolean) { if (!this._subject.value) this._subject.next(ready); }
	toPromise() {
		return this._subject.pipe(Rx.filter(v => !!v), Rx.take(1)).toPromise()
	}
	subscribe(next: () => void) {
		this._subject.pipe(Rx.filter(v => !!v), Rx.take(1), Rx.mapTo(void 0)).subscribe(next)
	}
}




