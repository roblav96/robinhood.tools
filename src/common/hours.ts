// 

export { }





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
	}
}


