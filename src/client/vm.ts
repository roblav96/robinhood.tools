// 

global.Promise = require('zousan/src/zousan')
// global.Zousan.suppressUncaughtRejectionError = true

import Vue from 'vue'
import '@/common/clock'
import '@/client/ui/directives'
import '@/client/ui/components'
import '@/client/adapters/robinhood'
import * as security from '@/client/adapters/security'
import socket from '@/client/adapters/socket'
import router from '@/client/router'
import store from '@/client/store'
import App from '@/client/app/app'



router.beforeEach(function(to, from, next) {
	if (store.state.security.ready) return next();
	security.token().catch(function(error) {
		console.error(`vm Error ->`, error)
	}).finally(function() {
		vm.$mount('#app')
		next()
		return socket.discover()
	})
})

const vm = new Vue({ router, store, render: h => h(App) })
export default vm


