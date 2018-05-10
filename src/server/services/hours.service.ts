// 

import '../main'
import dayjs from '../../common/dayjs'
import * as schedule from 'node-schedule'
import * as rkeys from '../../common/rkeys'
import * as pretty from '../../common/pretty'
import * as pandora from '../adapters/pandora'
import * as redis from '../adapters/redis'
import * as http from '../adapters/http'
import * as socket from '../adapters/socket'
import * as hours from '../adapters/hours'



schedule.scheduleJob('00 * * * *', syncHours).invoke()

async function syncHours() {
	let today = dayjs().format('YYYY-MM-DD')
	let url = 'https://api.robinhood.com/markets/XNYS/hours/' + today + '/'
	let rhours = await http.get(url) as Robinhood.Market.Hours
	let hours = { openToday: rhours.is_open, date: rhours.date } as Hours
	if (hours.openToday) {
		hours.prepre = dayjs(new Date(rhours.opens_at)).subtract(5, 'hour').subtract(30, 'minute').valueOf()
		hours.pre = dayjs(new Date(rhours.extended_opens_at)).valueOf()
		hours.opens = dayjs(new Date(rhours.opens_at)).valueOf()
		hours.closes = dayjs(new Date(rhours.closes_at)).valueOf()
		hours.post = dayjs(new Date(rhours.extended_closes_at)).valueOf()
		hours.postpost = dayjs(new Date(rhours.closes_at)).add(4, 'hour').valueOf()
	}
	await redis.main.hmset(rkeys.HR.HOURS, hours)
	pandora.broadcast({}, 'syncHours')
}

hours.rxhours.subscribe(function(hours) {
	if (hours) socket.emit(rkeys.HR.HOURS, hours);
})
hours.rxstate.subscribe(function(state) {
	if (state) socket.emit(rkeys.HR.STATE, state);
})


