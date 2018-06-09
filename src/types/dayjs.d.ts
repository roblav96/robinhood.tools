// 

import * as dayjs from 'dayjs'

declare module 'dayjs' {
	interface Dayjs {
		from(day: Dayjs, ago?: boolean): string
		fromNow(): string
		to(day: Dayjs): string
		toNow(): string
	}
}
