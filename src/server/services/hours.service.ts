// 

import '../main'
import dayjs from '../../common/dayjs'
import * as schedule from 'node-schedule'
import * as rkeys from '../../common/rkeys'
import * as redis from '../adapters/redis'
import * as http from '../adapters/http'
import * as socket from '../adapters/socket'
import * as hours from '../adapters/hours'
import radio from '../adapters/radio'



schedule.scheduleJob('00 * * * *', syncHours).invoke()

async function syncHours() {
	let today = dayjs().format('YYYY-MM-DD')
	let url = 'https://api.robinhood.com/markets/XNYS/hours/' + today + '/'
	let rhours = await http.get(url, { retries: 6, retryTick: '10s', silent: true }) as Robinhood.Hours
	let prevhours = await http.get(rhours.previous_open_hours, { retries: 6, retryTick: '10s', silent: true }) as Robinhood.Hours
	let nexthours = await http.get(rhours.next_open_hours, { retries: 6, retryTick: '10s', silent: true }) as Robinhood.Hours
	await redis.main.coms([
		['hmset', rkeys.HR.HOURS, hours.toHours(rhours) as any],
		['hmset', rkeys.HR.PREV_HOURS, hours.toHours(prevhours) as any],
		['hmset', rkeys.HR.NEXT_HOURS, hours.toHours(nexthours) as any],
	])
	radio.emit('syncHours')
}

hours.rxhours.subscribe(function(rhours) {
	if (rhours) socket.emit(rkeys.HR.HOURS, rhours);
})
hours.rxstate.subscribe(function(state) {
	if (state) socket.emit(rkeys.HR.STATE, state);
})
hours.rxprevhours.subscribe(function(prevhours) {
	if (prevhours) socket.emit(rkeys.HR.PREV_HOURS, prevhours);
})
hours.rxnexthours.subscribe(function(nexthours) {
	if (nexthours) socket.emit(rkeys.HR.NEXT_HOURS, nexthours);
})


