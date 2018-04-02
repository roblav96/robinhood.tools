// 

import * as rx from './rxjs'



export class ReadySubject {

	private _subject = new rx.BehaviorSubject(false)

	get value() { return this._subject.value }
	next(ready: boolean) { if (!this._subject.value) this._subject.next(ready); }

	toPromise() {
		return this._subject.pipe(rx.filter(v => !!v), rx.take(1)).toPromise()
	}

	subscribe(next: () => void) {
		this._subject.pipe(rx.filter(v => !!v), rx.take(1), rx.mapTo(void 0)).subscribe(next)
	}

}


