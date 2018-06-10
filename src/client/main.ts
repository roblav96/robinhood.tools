// 

require('../common/polyfills')

process.version = 'v9.11.1'
process.hrtime = require('browser-process-hrtime')

Object.assign(console, { dtsgen: function() { } })
if (process.env.DEVELOPMENT) {
	// console.dtsgen = require('../common/dtsgen').default
	Object.assign(window, require('../common/core'))
	Object.assign(window, { dayjs: require('dayjs') })
}

import 'echarts'
import 'modern-normalize'
import 'animate.css'
import './styles/vendors.scss'
import './styles/theme.scss'
import './styles/tailwind.css'
import './styles/styles.css'

import Vue from 'vue'
Vue.config.productionTip = false
Vue.config.performance = false
Vue.config.devtools = false

// import * as Vts from 'vue-property-decorator'
// @Vts.Component
// class VTouchPatch extends Vue {
// 	recognizers: Dict<Recognizer>
// 	mounted() { this.$nextTick(this.requireFailure) }
// 	requireFailure() {
// 		console.log('requireFailure ->')
// 		let tap = this.recognizers['tap']
// 		let singletap = this.recognizers['singletap']
// 		let doubletap = this.recognizers['doubletap']
// 		let tripletap = this.recognizers['tripletap']
// 		if (tap && doubletap && tripletap) {
// 			console.warn('requireFailure ->')
// 			// tap.requireFailure(doubletap)
// 			// tripletap.recognizeWith(doubletap)
// 			// tripletap.recognizeWith(tap)
// 			// doubletap.recognizeWith(tap)
// 			// doubletap.requireFailure(tripletap)
// 			// tap.requireFailure(tripletap)
// 			// tap.requireFailure(doubletap)
// 		}
// 	}
// }
// import VueTouch from 'vue-touch'
// VueTouch.component.mixins = [VTouchPatch]
// // VueTouch.registerCustomEvent('singletap', { type: 'tap', taps: 1 })
// VueTouch.registerCustomEvent('doubletap', { type: 'tap', taps: 2 })
// VueTouch.registerCustomEvent('tripletap', { type: 'tap', taps: 3 })
// Vue.use(VueTouch)

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


