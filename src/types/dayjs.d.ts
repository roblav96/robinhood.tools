// 

import * as dayjs from 'dayjs'

declare module 'dayjs' {
	interface Dayjs {
		from(day: Dayjs, suffix?: boolean): string
		fromNow(suffix?: boolean): string
		to(day: Dayjs, suffix?: boolean): string
		toNow(suffix?: boolean): string
	}
}
