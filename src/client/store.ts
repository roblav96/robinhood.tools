// 

import Vue, { ComponentOptions } from 'vue'
import Vuex, { Store } from 'vuex'
import * as core from '../common/core'



const state = {} as Store.State

interface VuexStore { getters: Store.Getters }
class VuexStore extends Vuex.Store<Store.State> {
	register<K extends keyof Store.State>(path: K, state: Store.State[K], getters?: any) {
		super.registerModule(path, { state, getters })
	}
	unregister<K extends keyof Store.State>(path: K) {
		Vue.delete(this.state, path)
		core.nullify(this.state[path])
		super.unregisterModule(path)
	}
}

const store = new VuexStore({
	state, strict: false,
	plugins: [],
	getters: {},
})
export default store

// setImmediate(() => console.log('store.getters ->', store.getters))



let load = require.context('./stores/', true, /\.ts$/)
load.keys().forEach(file => load(file))





declare global {
	namespace Store {
		interface State { }
		interface Getters { }
	}
}

declare module 'vue/types/options' {
	export interface ComponentOptions<V extends Vue> {
		store?: VuexStore
	}
}

declare module 'vue/types/vue' {
	export interface Vue {
		$store: VuexStore
	}
}


