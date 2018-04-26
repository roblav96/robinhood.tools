// 

import Vue, { ComponentOptions } from 'vue'
import Vuex, { Store } from 'vuex'



const state = {} as Store.State

export default new Vuex.Store<Store.State>({
	state, strict: false,
	plugins: [],
	getters: {},
})



let load = require.context('./stores/', true, /\.ts$/)
load.keys().forEach(file => load(file))





declare global {
	namespace Store {
		interface State { }
	}
}

declare module 'vue/types/options' {
	export interface ComponentOptions<V extends Vue> {
		store?: Store<Store.State>
	}
}

declare module 'vue/types/vue' {
	export interface Vue {
		$store: Store<Store.State>
	}
}


