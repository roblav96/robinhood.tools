//

import '../main'
import * as dayjs from 'dayjs'
import * as schedule from 'node-schedule'
import * as rkeys from '../../common/rkeys'
import * as redis from '../adapters/redis'
import * as http from '../../common/http'
import * as socket from '../adapters/socket'
import * as hours from '../adapters/hours'
import radio from '../adapters/radio'

// let resetjob: schedule.Job
// function onreset(date: Date) {
// 	console.log(`date ->`, date)
// }

schedule.scheduleJob('00 * * * *', syncHours).invoke()
async function syncHours() {
	let today = dayjs().format('YYYY-MM-DD')
	let url = 'https://api.robinhood.com/markets/XNYS/hours/' + today + '/'
	let config = { retries: 6, retryTick: '10s', silent: true } as Http.Config
	let rhours = (await http.get(url, config)) as Robinhood.Hours
	let previous = (await http.get(rhours.previous_open_hours, config)) as Robinhood.Hours
	let next = (await http.get(rhours.next_open_hours, config)) as Robinhood.Hours
	let hhours = hours.toHours(rhours)
	hhours.previous = JSON.stringify(hours.toHours(previous)) as any
	hhours.next = JSON.stringify(hours.toHours(next)) as any
	await redis.main.hmset(rkeys.HR.HOURS, hhours)
	radio.emit('syncHours')
	// let day = dayjs(hhours.prepre).subtract(1,)
	// schedule.scheduleJob('00 * * * *', syncHours)
}

hours.rxhours.subscribe(function (rhours) {
	if (rhours) socket.emit(rkeys.HR.HOURS, rhours)
})
hours.rxstate.subscribe(function (state) {
	if (state) socket.emit(rkeys.HR.STATE, state)
})
