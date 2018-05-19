// 

require('@/common/polyfills')

global.Promise = require('zousan/src/zousan')
global.Zousan.suppressUncaughtRejectionError = true

Object.assign(console, { dtsgen: function() { } })
if (process.env.DEVELOPMENT) {
	// console.dtsgen = require('@/common/dtsgen').default
	Object.assign(window, require('@/common/core'))
	Object.assign(window, require('@/common/pretty'))
}

import 'modern-normalize'
import 'animate.css'
import '@/client/styles/tailwind.css'
import '@/client/styles/vendors.scss'
import '@/client/styles/theme.scss'
import '@/client/styles/styles.css'

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
	defaultSnackbarDuration: 10000,
	defaultToastDuration: 10000,
	defaultInputAutocomplete: 'off',
	defaultNoticeQueue: false,
	defaultTooltipType: 'is-primary',
} as BuefyConfig)

require('@/client/vm')


