// 

require('@/common/polyfills')
// require('source-map-support').install()
// import * as sourcemaps from 'source-map-support'
// sourcemaps.install({
// 	overrideRetrieveFile: true,
// 	overrideRetrieveSourceMap:true,
// })

global.Promise = require('bluebird/js/browser/bluebird.core.js')
{ (global.Promise as any).config({ warnings: { wForgottenReturn: false } }) }

import * as _ from '@/common/lodash'
Object.assign(console, { dtsgen: _.noop, dump: _.noop })
// if (process.env.DEVELOPMENT) console.dtsgen = require('@/common/dtsgen').default;

import 'repaintless/repaintless-scss/repaintless.scss'
import '@/client/styles/theme.scss'
import '@/client/styles/plex.scss'
import '@/client/styles/mdi.scss'
import '@/client/styles/styles.css'
import '@/client/styles/tailwind.out.css'

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


