// 

import '../common/polyfills'

import * as sourcemaps from 'source-map-support'
sourcemaps.install()

global.Promise = require('bluebird')
{ (global.Promise as any).config({ warnings: { wForgottenReturn: false } }) }
const clusterws = require('clusterws/dist')
global.WebSocket = clusterws.uWebSocket

import './adapters/process'
import './adapters/console'
import '../common/clock'


