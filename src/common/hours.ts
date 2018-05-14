// 



export const HR = {
	HOURS: 'hours:hours',
	STATE: 'hours:state',
}



export function getState(hours: Hours, stamp = Date.now()): Hours.State {
	if (hours.openToday == false) return 'CLOSED';
	if (stamp >= hours.prepre && stamp < hours.pre) return 'PREPRE';
	if (stamp >= hours.pre && stamp < hours.opens) return 'PRE';
	if (stamp >= hours.opens && stamp < hours.closes) return 'REGULAR';
	if (stamp >= hours.closes && stamp < hours.post) return 'POST';
	if (stamp >= hours.post && stamp < hours.postpost) return 'POSTPOST';
	return 'CLOSED'
}





declare global {
	namespace Hours {
		type State = 'PREPRE' | 'PRE' | 'REGULAR' | 'POST' | 'POSTPOST' | 'CLOSED'
	}
	interface Hours {
		openToday: boolean
		date: string
		prepre: number
		pre: number
		opens: number
		closes: number
		post: number
		postpost: number
	}
}


