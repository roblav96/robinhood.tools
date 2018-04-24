// 

import '../common/polyfills'

import * as sourcemaps from 'source-map-support'
sourcemaps.install()

global.Promise = require('bluebird')
Promise.config({ warnings: { wForgottenReturn: false } })
global.WebSocket = require('clusterws/dist').uWebSocket

import './adapters/process'
import './adapters/console'
import '../common/clock'


