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

// 

import * as Rx from './rxjs'



export class ReadySubject {

	private _subject = new Rx.BehaviorSubject(false)

	get value() { return this._subject.value }
	next() { if (!this.value) this._subject.next(true); }

	private _pipe() {
		return this._subject.pipe(Rx.filter(v => !!v), Rx.take(1), Rx.mapTo(void 0))
	}
	toPromise() { return this._pipe().toPromise() }
	subscribe(next: () => void) { return this._pipe().subscribe(next) }



	// next(value?: boolean) {
	// 	if (typeof value == 'boolean') {
	// 		if (value != this.value) this._subject.next(value);
	// 	} else {
	// 		if (!this._subject.value) this._subject.next(true);
	// 	}
	// }
	// private _pipe() {
	// 	return this._subject.pipe(Rx.filter(v => !!v), Rx.take(1), Rx.mapTo(void 0))
	// }
	// toPromise() { return this._pipe().toPromise() }
	// subscribe(next: () => void) { return this._pipe().subscribe(next) }

}




