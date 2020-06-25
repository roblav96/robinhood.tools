//

import Vue from 'vue'
import '../common/clock'
import './ui/directives'
import './ui/components'
import './adapters/robinhood'
import * as security from './adapters/security'
import socket from './adapters/socket'
import router from './router'
import store from './store'
import App from './app/app'

router.beforeEach(function (to, from, next) {
	if (store.state.security.ready) return next()
	security
		.token()
		.catch(function (error) {
			console.error(`vm Error ->`, error)
		})
		.finally(function () {
			vm.$mount('#app')
			next()
			return socket.discover()
		})
})

const vm = new Vue({ router, store, render: (h) => h(App) })
export default vm
