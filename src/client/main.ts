// 

require('../common/polyfills')

process.version = 'v9.11.1'
process.hrtime = require('browser-process-hrtime')

Object.assign(console, { dtsgen: function() { } })
if (process.env.DEVELOPMENT) {
	// console.dtsgen = require('../common/dtsgen').default
	Object.assign(window, require('../common/core'))
	Object.assign(window, { dayjs: require('dayjs') })
	require('echarts')
}



// import 'modern-normalize'
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
// 	mounted() {
// 		this.$nextTick(() => {
// 			if (!this.recognizers['doubletap'] && !this.recognizers['tripletap']) return;
// 			let dummy = { recognizeWith: global.noop, requireFailure: global.noop } as Recognizer
// 			let tap = this.recognizers['tap'] || dummy
// 			let doubletap = this.recognizers['doubletap'] || dummy
// 			let tripletap = this.recognizers['tripletap'] || dummy
// 			tripletap.recognizeWith([doubletap, tap])
// 			doubletap.recognizeWith(tap)
// 			doubletap.requireFailure(tripletap)
// 			tap.requireFailure([tripletap, doubletap])
// 		})
// 	}
// }

// import VueTouch from 'vue-touch'
// VueTouch.component.mixins = [VTouchPatch]
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


