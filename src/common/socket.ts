// 



export const WS = {
	HASH: '#',
	SUBS: 'subs',
}





import * as uws from 'uws'
declare global {
	namespace Socket {
		interface Client extends uws.WebSocket {
			subs: string[]
			authed: boolean
			doc: Security.Doc
		}
		interface Payload<Data = any> {
			name: string
			data: Data
			action: string
			subs: string[]
		}
	}
}


