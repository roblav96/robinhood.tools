// 

import '../main'
import '../adapters/hours'
import * as Pandora from 'pandora'
import * as Hub from 'pandora-hub'
import * as redis from '../adapters/redis'
import * as socket from '../adapters/socket'
import * as stocks from '../adapters/stocks'
import * as webull from '../adapters/webull'



const watcher = new webull.MqttClient({
	topics: 'stocks',
	connect: false,
	verbose: false,
})

async function onchunkSymbols() {
	watcher.options.fsymbols = await stocks.getFullSymbols()
	watcher.connect()
}

const hub = Pandora.getHub()
hub.hubClient.on('chunkSymbols', onchunkSymbols)


