// 

import { BehaviorSubject } from 'rxjs'
import { filter, take, mapTo } from 'rxjs/operators'



export class ReadySubject {

	private _subject = new BehaviorSubject(false)

	get ready() { return this._subject.value }
	set ready(ready: boolean) { if (!this._subject.value) this._subject.next(ready); }

	toPromise() {
		return this._subject.pipe(filter(v => !!v), take(1)).toPromise()
	}

	subscribe(next: () => void) {
		this._subject.pipe(filter(v => !!v), take(1), mapTo(void 0)).subscribe(next)
	}

}


