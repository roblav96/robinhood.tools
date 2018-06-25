// 

require('../common/polyfills')

Object.assign(console, { dtsgen: function() { } })
if (process.env.DEVELOPMENT) {
	require('echarts')
	process.version = 'v9.11.1'
	process.hrtime = require('browser-process-hrtime')
	// console.dtsgen = require('../common/dtsgen').default; console.warn(`console.dtsgen`)
	Object.assign(window, require('../common/core'))
	Object.assign(window, require('../common/pretty'))
	Object.assign(window, { dayjs: require('dayjs') })
}

import 'animate.css'
import './styles/vendors.scss'
import './styles/theme.scss'
import './styles/tailwind.css'
import './styles/styles.css'

import Vue from 'vue'
Vue.config.productionTip = false
Vue.config.performance = false
Vue.config.devtools = false
Vue.config.warnHandler = function(message, vm, trace) {
	if (message.startsWith('Avoid mutating a prop directly')) return;
	console.warn(vm && vm.$options && vm.$options.name, `->`, message, trace)
}

import VueRouter from 'vue-router'
Vue.use(VueRouter)

import Vuex from 'vuex'
Vue.use(Vuex)

import Buefy, { BuefyConfig } from 'buefy'
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
