// 

import * as dayjs from 'dayjs'



export const HR = {
	HOURS: 'hours:hours',
	STATE: 'hours:state',
}



export function getState(hhours: Hours, stamp = Date.now()): Hours.State {
	if (hhours.isOpenToday == false) return 'CLOSED';
	if (stamp >= hhours.prepre && stamp < hhours.pre) return 'PREPRE';
	if (stamp >= hhours.pre && stamp < hhours.opens) return 'PRE';
	if (stamp >= hhours.opens && stamp < hhours.closes) return 'REGULAR';
	if (stamp >= hhours.closes && stamp < hhours.post) return 'POST';
	if (stamp >= hhours.post && stamp < hhours.postpost) return 'POSTPOST';
	return 'CLOSED'
}



export function toHours(rhours: Robinhood.Hours) {
	let hhours = {
		isOpenToday: rhours.is_open,
		date: rhours.date,
		prepre: null, pre: null,
		opens: null, closes: null,
		post: null, postpost: null,
	} as Hours
	if (hhours.isOpenToday) {
		hhours.prepre = dayjs(new Date(rhours.opens_at)).subtract(5, 'hour').subtract(30, 'minute').valueOf()
		hhours.pre = dayjs(new Date(rhours.extended_opens_at)).valueOf()
		hhours.opens = dayjs(new Date(rhours.opens_at)).valueOf()
		hhours.closes = dayjs(new Date(rhours.closes_at)).valueOf()
		hhours.post = dayjs(new Date(rhours.extended_closes_at)).valueOf()
		hhours.postpost = dayjs(new Date(rhours.closes_at)).add(4, 'hour').valueOf()
	}
	return hhours
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


