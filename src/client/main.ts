// 
global.NODE_ENV = process.env.NODE_ENV
global.DEVELOPMENT = NODE_ENV == 'development'
global.PRODUCTION = NODE_ENV == 'production'
global.Promise = require('bluebird')
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

// dynamic import all
// let load = require.context('./store/', true, /\.ts$/)
// load.keys().forEach(function(file) {
// 	console.log('file >', file)
// 	// load(file)
// })


