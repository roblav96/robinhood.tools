// 

import Vue, { ComponentOptions } from 'vue'
import Vuex, { Store } from 'vuex'
import * as security from './security'



export class State {

	security = security.state

}

export const store = new Vuex.Store<State>({
	strict: false,
	state: new State(),
	plugins: [],
	getters: {},
})
export default store

// console.log('store.state', store.state)





declare module 'vue/types/options' {
	interface ComponentOptions<V extends Vue> {
		store?: Store<State>
	}
}

declare module 'vue/types/vue' {
	interface Vue {
		$store: Store<State>
	}
}


