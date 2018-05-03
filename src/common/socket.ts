// 



export const WS = {
	SYMBOL: 'symbol',
	QUOTE: 'symbol:quote',
}





declare global {
	namespace Socket {
		interface Message<Data = any> {
			name: string
			data: Data
			action: string
			subs: string[]
		}
	}
}


