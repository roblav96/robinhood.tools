//

import * as dayjs from 'dayjs'

export const HR = {
	HOURS: 'hours:hours',
	STATE: 'hours:state',
}

export function getState(hours: Hours, stamp = Date.now()): Hours.State {
	if (!hours || hours.isOpenToday == false) return 'CLOSED'
	if (stamp >= hours.prepre && stamp < hours.pre) return 'PREPRE'
	if (stamp >= hours.pre && stamp < hours.opens) return 'PRE'
	if (stamp >= hours.opens && stamp < hours.closes) return 'REGULAR'
	if (stamp >= hours.closes && stamp < hours.post) return 'POST'
	if (stamp >= hours.post && stamp < hours.postpost) return 'POSTPOST'
	return 'CLOSED'
}

export function toHours(rhours: Robinhood.Hours) {
	let hours = {
		isOpenToday: rhours.is_open,
		date: rhours.date,
		prepre: null,
		pre: null,
		opens: null,
		closes: null,
		post: null,
		postpost: null,
	} as Hours
	if (hours.isOpenToday) {
		hours.prepre = dayjs(new Date(rhours.opens_at))
			.subtract(5, 'hour')
			.subtract(30, 'minute')
			.valueOf()
		hours.pre = dayjs(new Date(rhours.extended_opens_at)).valueOf()
		hours.opens = dayjs(new Date(rhours.opens_at)).valueOf()
		hours.closes = dayjs(new Date(rhours.closes_at)).valueOf()
		hours.post = dayjs(new Date(rhours.extended_closes_at)).valueOf()
		hours.postpost = dayjs(new Date(rhours.closes_at)).add(4, 'hour').valueOf()
	}
	return hours
}

declare global {
	namespace Hours {
		type State = 'PREPRE' | 'PRE' | 'REGULAR' | 'POST' | 'POSTPOST' | 'CLOSED'
	}
	interface Hours {
		isOpenToday: boolean
		date: string
		prepre: number
		pre: number
		opens: number
		closes: number
		post: number
		postpost: number
		previous: Hours
		next: Hours
	}
}
// declare namespace NodeJS { interface Global { hours: Hours, state: Hours.State } }
