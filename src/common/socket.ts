// 



export const WS = {
	// UUID: 'ws:uuid',
}



declare global {
	namespace Socket {
		type Actions = 'sync'
		interface Event<Data = any> {
			name: string
			data: Data
			action: Actions
			subs: string[]
		}
	}
}





