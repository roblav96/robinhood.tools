// 

global.NODE_ENV = process.env.NODE_ENV as any
global.DEVELOPMENT = NODE_ENV == 'development'
global.PRODUCTION = NODE_ENV == 'production'

// 

import '@ibm/plex/css/ibm-plex.css'
import 'mdi/css/materialdesignicons.css'

import Vue from 'vue'
import VueRouter from 'vue-router'
import Vuex from 'vuex'
import Buefy, { BuefyConfig } from 'buefy'

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
} as BuefyConfig)

// import * as Vts from 'vue-property-decorator'
// Vts.Component.registerHooks(['beforeRouteEnter', 'beforeRouteLeave', 'beforeRouteUpdate'])

require('@/client/router')


