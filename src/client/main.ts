// 

require('@/common/polyfills')
global.Promise = require('bluebird')

global.NODE_ENV = process.env.NODE_ENV || 'development'
global.DEVELOPMENT = NODE_ENV == 'development'
global.PRODUCTION = NODE_ENV == 'production'

process.NAME = process.env.NAME
process.VERSION = process.env.VERSION
process.DOMAIN = process.env.DOMAIN
process.CLIENT = true

Object.assign(console, { dump() { } })

// 

import Vue from 'vue'
import VueRouter from 'vue-router'
import Vuex from 'vuex'
import Buefy, { BuefyConfig } from 'buefy'

Vue.config.productionTip = false
Vue.config.performance = false
Vue.config.devtools = false

Vue.use(VueRouter)
Vue.use(Vuex)
Vue.use(Buefy, {
	defaultSnackbarDuration: 5000,
	defaultToastDuration: 5000,
	defaultInputAutocomplete: 'off',
	defaultNoticeQueue: false,
	defaultTooltipType: 'is-dark',
} as BuefyConfig)

require('@/client/vm')

if (DEVELOPMENT) {
	Object.assign(window, require('@/common/core'))
}


