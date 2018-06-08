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
	skip,
} from 'rxjs/operators'

export {
	OperatorFunction,
} from 'rxjs/internal/types'

import * as Rx from './rxjs'



// export function subscription<T>(observable: T) {
// 	return (((observable as any) as Rx.Observable<any>).pipe(
// 		Rx.skip(1),
// 		Rx.filter(v => !(v == null)),
// 	) as any) as T
// }

// export function promise<T>(observable: T) {
// 	return (((observable as any) as Rx.Observable<any>).pipe(
// 		Rx.skip(1),
// 		Rx.filter(v => !(v == null)),
// 		Rx.take(1),
// 	) as any) as T
// }

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




