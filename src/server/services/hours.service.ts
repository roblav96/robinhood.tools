// 

import '../main'
import '../adapters/socket'
import * as Luxon from 'luxon'
import * as schedule from 'node-schedule'
import * as rkeys from '../../common/rkeys'
import * as pandora from '../adapters/pandora'
import * as redis from '../adapters/redis'
import * as http from '../adapters/http'



async function syncHours() {
	let today = Luxon.DateTime.local().toISODate()
	let url = 'https://api.robinhood.com/markets/XNYS/hours/' + today + '/'
	let rhmarket = await http.get(url, { retries: Infinity }) as Robinhood.Market.Hours
	let hours = { isOpenToday: rhmarket.is_open, date: rhmarket.date } as Hours
	if (hours.isOpenToday) {
		hours.prepre = Luxon.DateTime.fromISO(rhmarket.opens_at).minus({ hours: 5, minutes: 30 }).valueOf()
		hours.pre = Luxon.DateTime.fromISO(rhmarket.extended_opens_at).valueOf()
		hours.opens = Luxon.DateTime.fromISO(rhmarket.opens_at).valueOf()
		hours.closes = Luxon.DateTime.fromISO(rhmarket.closes_at).valueOf()
		hours.post = Luxon.DateTime.fromISO(rhmarket.extended_closes_at).valueOf()
		hours.postpost = Luxon.DateTime.fromISO(rhmarket.closes_at).plus({ hours: 4 }).valueOf()
	}
	await redis.main.hmset(rkeys.HOURS, hours)
	pandora.broadcast({}, 'syncHours')
}

schedule.scheduleJob('00 * * * *', syncHours).invoke()


