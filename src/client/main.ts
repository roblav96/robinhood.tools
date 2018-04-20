// 

require('@/common/polyfills')

global.NODE_ENV = process.env.NODE_ENV || 'development'
global.DEVELOPMENT = NODE_ENV == 'development'
global.PRODUCTION = NODE_ENV == 'production'
global.Promise = require('bluebird')

process.NAME = process.env.NAME
process.VERSION = process.env.VERSION
process.DOMAIN = process.env.DOMAIN
process.CLIENT = true

import * as _ from '@/common/lodash'
Object.assign(console, { dtsgen: _.noop, dump: _.noop })
// if (DEVELOPMENT) console.dtsgen = require('@/common/dtsgen').default;

// import 'tailwindcss/dist/utilities.css'
import 'repaintless/repaintless-css/repaintless.css'
import '@/client/styles/fonts.scss'
import '@/client/styles/spectre.scss'
import '@/client/styles/styles.css'

import Vue from 'vue'
import VueRouter from 'vue-router'
import Vuex from 'vuex'

Vue.config.productionTip = false
Vue.config.performance = false
Vue.config.devtools = false

Vue.use(VueRouter)
Vue.use(Vuex)

require('@/client/vm')


