// 

require('@/common/polyfills')
global.Promise = require('zousan/src/zousan'); { (global as any).Zousan.suppressUncaughtRejectionError = true }

import { Settings } from 'luxon'
Settings.defaultZoneName = 'America/New_York'

import * as _ from '@/common/lodash'
Object.assign(console, { dtsgen: _.noop, dump: _.noop })
// if (process.env.DEVELOPMENT) console.dtsgen = require('@/common/dtsgen').default;
if (process.env.DEVELOPMENT) Object.assign(window, require('@/common/core'));

import 'animate.css'
import '@/client/styles/tailwind.css'
import '@/client/styles/vendors.scss'
import '@/client/styles/theme.scss'

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


