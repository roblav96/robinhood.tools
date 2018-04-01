// 

import * as eyes from 'eyes'
import * as cron from 'cron'
import * as pdelay from 'delay'
import * as pevent from 'p-event'
import * as pall from 'p-all'
import * as pforever from 'p-forever'
import * as pqueue from 'p-queue'
import ticks from '../../common/ticks'
import * as redis from '../adapters/redis'
import * as http from '../adapters/http'
import * as robinhood from '../adapters/robinhood'



import * as cctz from 'cctz'

console.warn('cctz ->', console.dtsgen(cctz))



// import * as rx from 'rxjs'
// import { websocket } from 'rxjs/websocket'

// const rxInstrument = new rx.Subject()
// // console.log('rxInstrument1 ->', rxInstrument)



async function getInstruments(url: string) {
	let response = await http.get(url)
	// console.warn('response ->', console.dtsgen(response))
	// console.warn('response ->', eyes.inspect(console.dtsgen(response)))
}

async function doForever() {
	await pforever(function(url) {
		if (url) return onUrl(url);
		return pforever.end
	}, 'https://api.robinhood.com/instruments/')
}

function syncInstruments() {
	return doForever().catch(function(error) {
		console.error('syncInstruments Error ->', error)
		return pevent(ticks, ticks.T5).then(syncInstruments)
	})
}



function startFullSync() {
	
}

function ensure(args) {
	
}



/**▶ 3:40 AM Weekdays */
const job = new cron.CronJob({
	cronTime: '40 03 * * 1-5',
	timeZone: 'America/New_York',
	start: true,
	// onTick: syncInstruments,
	runOnInit: DEVELOPMENT,
})






