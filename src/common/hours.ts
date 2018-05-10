// 



export const HR = {
	HOURS: 'hours:hours',
	STATE: 'hours:state',
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


