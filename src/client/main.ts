// 

require('../common/polyfills')

global.Promise = require('zousan')
global.Zousan.suppressUncaughtRejectionError = true

process.version = 'v9.11.1'
process.hrtime = require('browser-process-hrtime')

Object.assign(console, { dtsgen: function() { } })
if (process.env.DEVELOPMENT) {
	// console.dtsgen = require('../common/dtsgen').default
	Object.assign(window, require('../common/core'))
	// Object.assign(window, require('../common/pretty'))
}

import 'modern-normalize'
import 'animate.css'
import './styles/vendors.scss'
import './styles/theme.scss'
import './styles/tailwind.css'
import './styles/styles.css'

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
	defaultNoticeQueue: false,
	defaultSnackbarDuration: 5000,
	defaultToastDuration: 5000,
	defaultInputAutocomplete: 'off',
	defaultTooltipType: 'is-dark',
	defaultDialogConfirmText: 'Confirm',
	defaultDialogCancelText: 'Cancel',
} as BuefyConfig)

require('./vm')


