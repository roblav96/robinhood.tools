// 

require('@/common/polyfills')

global.Promise = require('bluebird/js/browser/bluebird.core.js')
Promise.config({ warnings: { wForgottenReturn: false } })

import * as _ from '@/common/lodash'
Object.assign(console, { dtsgen: _.noop, dump: _.noop })
// if (process.env.DEVELOPMENT) console.dtsgen = require('@/common/dtsgen').default;
if (process.env.DEVELOPMENT) Object.assign(window, require('@/common/core'));

import 'animate.css'
import '@/client/styles/theme.scss'
import '@/client/styles/vendors.scss'
import '@/client/styles/tailwind.build.css'

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
	defaultTooltipType: 'is-primary',
} as BuefyConfig)

require('@/client/vm')


