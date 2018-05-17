// 

import Vue, { ComponentOptions } from 'vue'
import Vuex, { Store } from 'vuex'
import * as core from '@/common/core'



const state = {} as Store.State

class VuexStore<T extends Store.State> extends Vuex.Store<T> {
	register<K extends keyof T>(path: K, state: T[K]) {
		super.registerModule(path, { state })
	}
	unregister<K extends keyof T>(path: K) {
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


