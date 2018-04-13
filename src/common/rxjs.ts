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

	private subject = new Rx.BehaviorSubject(false)

	get value() { return this.subject.value }
	next(value?: boolean) {
		if (typeof value == 'boolean') {
			if (value != this.value) this.subject.next(value);
		} else {
			if (!this.value) this.subject.next(true);
		}
	}

	private pipe(opts = { void: false }) {
		let args = opts.void ? [Rx.mapTo(void 0)] : []
		return this.subject.pipe(Rx.filter(v => !!v), Rx.take(1), ...args)
	}
	toPromise(): Promise<boolean> {
		return this.pipe().toPromise()
	}
	subscribe(next: (value: boolean) => void) {
		return this.pipe().subscribe(next)
	}

}




