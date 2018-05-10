// 

import Vuex, { Store } from 'vuex'
import lockr from 'lockr'
import * as _ from '@/common/lodash'
import store from '@/client/store'
import router from '@/client/router'



let state = lockr.get('recents', []) as Recent[]
store.registerModule('recents', { state })
declare global {
	namespace Store { interface State { recents: typeof state } }
	interface Recent {
		symbol: string
		stamp: number
	}
}

export function push(symbol: string) {
	state.remove(v => v.symbol == symbol)
	state.unshift({ symbol, stamp: Date.now() })
	state.splice(20)
	lockr.set('recents', state)
}

router.afterEach(function(to, from) {
	if (to.name == 'symbol' && to.params.symbol) {
		push(to.params.symbol)
	}
})


