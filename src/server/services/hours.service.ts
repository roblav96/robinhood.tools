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
	let hhours = {
		openToday: rhours.is_open,
		date: rhours.date,
		prepre: null, pre: null,
		opens: null, closes: null,
		post: null, postpost: null,
	} as Hours
	if (hhours.openToday) {
		hhours.prepre = dayjs(new Date(rhours.opens_at)).subtract(5, 'hour').subtract(30, 'minute').valueOf()
		hhours.pre = dayjs(new Date(rhours.extended_opens_at)).valueOf()
		hhours.opens = dayjs(new Date(rhours.opens_at)).valueOf()
		hhours.closes = dayjs(new Date(rhours.closes_at)).valueOf()
		hhours.post = dayjs(new Date(rhours.extended_closes_at)).valueOf()
		hhours.postpost = dayjs(new Date(rhours.closes_at)).add(4, 'hour').valueOf()
	}
	await redis.main.hmset(rkeys.HR.HOURS, hhours)
	radio.emit('syncHours')
}

hours.rxhours.subscribe(function(rhours) {
	if (rhours) socket.emit(rkeys.HR.HOURS, rhours);
})
hours.rxstate.subscribe(function(state) {
	if (state) socket.emit(rkeys.HR.STATE, state);
})


