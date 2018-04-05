// 

export {
	of,
	Observable,
	Subject,
	BehaviorSubject,
} from 'rxjs'

export {
	filter,
	take,
	mapTo,
	scan,
	map,
} from 'rxjs/operators'

// 

import * as Rx from './rxjs'



export class ReadySubject {

	private _subject = new Rx.BehaviorSubject(false)

	get value() { return this._subject.value }
	next() {
		if (!this._subject.value) this._subject.next(true);
	}

	pipe() {
		return this._subject.pipe(Rx.filter(v => !!v), Rx.take(1), Rx.mapTo(void 0))
	}
	toPromise() { return this.pipe().toPromise() }
	subscribe(next: () => void) { return this.pipe().subscribe(next) }

}




