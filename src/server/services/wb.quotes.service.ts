// 

import '../main'
import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as rkeys from '../../common/rkeys'
import * as pandora from '../adapters/pandora'
import * as redis from '../adapters/redis'
import * as socket from '../adapters/socket'
import * as utils from '../adapters/utils'
import * as webull from '../adapters/webull'
import * as watcher from '../adapters/watcher'
import Emitter from '../../common/emitter'
import clock from '../../common/clock'
// const watcher = require('../adapters/watcher') as WebullWatcher<Webull.Quote>

watcher.rkey = ''

watcher.ondata = function ondata(topic, wbquote) {
	console.log(`topic ->`, topic)
	return {} as Webull.Quote
}


