// 

import Vuex, { Store } from 'vuex'
import lockr from 'lockr'
import * as _ from '../../common/lodash'
import store from '../store'
import router from '../router'



interface Recent { symbol: string, stamp: number }
let state = lockr.get('recents', []) as Recent[]
store.register('recents', state)
declare global { namespace Store { interface State { recents: typeof state } } }



router.afterEach(function(to, from) {
	if (to.name.indexOf('symbol') == 0) {
		let symbol = to.params.symbol
		state.remove(v => v.symbol == symbol)
		state.unshift({ symbol, stamp: Date.now() })
		state.splice(20)
		lockr.set('recents', state)
	}
})


