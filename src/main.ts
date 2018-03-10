// 

global.NODE_ENV = process.env.NODE_ENV as any
global.DEVELOPMENT = NODE_ENV == 'development'
global.PRODUCTION = NODE_ENV == 'production'
global.DOMAIN = process.env.VUE_APP_DOMAIN
global.VERSION = '0.0.1'

import ee3 from 'eventemitter3'
global.EE3 = new ee3.EventEmitter()

// 

// if (PRODUCTION) {
// let script = document.createElement('script')
// script.setAttribute('src', 'https://www.google.com/recaptcha/api.js?render=explicit')
// script.async = true
// script.defer = true
// document.body.appendChild(script)
// }

import '@ibm/plex/css/ibm-plex.css'
import 'mdi/css/materialdesignicons.css'

import * as Vts from 'vue-property-decorator'
import Vue from 'vue'
import VueRouter from 'vue-router'
import Vuex from 'vuex'
import Buefy from 'buefy'



Vue.config.devtools = false
Vue.config.productionTip = false
Vue.config.performance = false

Vue.use(VueRouter)
Vue.use(Vuex)
Vue.use(Buefy, {
	defaultSnackbarDuration: 5000,
	defaultToastDuration: 5000,
	defaultInputAutocomplete: 'off',
	defaultNoticeQueue: false,
})

// Vts.Component.registerHooks(['beforeRouteEnter', 'beforeRouteLeave', 'beforeRouteUpdate'])

require('@/client/router')


