// 

import Vuex, { Store } from 'vuex'
import lockr from 'lockr'
import * as _ from '@/common/lodash'
import store from '@/client/store'



let state = lockr.get('recents', []) as Recent[]
store.registerModule('recents', { state })
declare global {
	namespace Store { interface State { recents: Recent[] } }
	interface Recent {
		symbol: string
		stamp: number
		search: boolean
	}
}



export function push(symbol: string, search = false) {
	state.unshift({ symbol, search, stamp: Date.now() })
	state = _.uniqBy(_.compact(state), 'symbol').splice(0, 50)
	lockr.set('recents', state)
}


