// 

export { }



declare global {
	namespace Socket {
		interface Event<Data = any> {
			name: string
			data: Data
			action: string
			subs: string[]
		}
	}
}





