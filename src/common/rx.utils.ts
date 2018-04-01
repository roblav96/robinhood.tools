// 

import * as rx from 'rxjs'
import * as ops from 'rxjs/operators'



export class ReadySubject {
	subject = new rx.BehaviorSubject(false)
	get ready() { return this.subject.value }
	set ready(ready: boolean) { if (!this.subject.value) this.subject.next(ready); }
	toPromise() { return this.subject.pipe(ops.filter(v => !!v), ops.take(1)).toPromise() }
	addListener(fn: (ready: boolean) => void) { this.subject.pipe(ops.filter(v => !!v), ops.take(1)).subscribe(fn) }
}


