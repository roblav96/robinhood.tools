// 

import * as core from '../../common/core'
import * as Rx from '../../common/rxjs'
import * as schedule from 'node-schedule'
import * as Luxon from 'luxon'
import * as pandora from './pandora'
import * as redis from './redis'



export const rxhours = new Rx.BehaviorSubject(null as Hours)
export const rxstate = new Rx.BehaviorSubject(null as Hours.State)

async function onsyncHours() {
	let hours = await redis.main.hgetall(redis.HOURS) as Hours
	core.fix(hours)
	rxhours.next(hours)
	rxstate.next(getState())
}
pandora.on('syncHours', onsyncHours)
schedule.scheduleJob('* * * * *', onsyncHours).invoke()



export function getState(stamp = Luxon.DateTime.local().valueOf()): Hours.State {
	let hours = rxhours.value
	if (hours.isOpenToday == false) return 'CLOSED';
	if (stamp >= hours.prepre && stamp < hours.pre) return 'PREPRE';
	if (stamp >= hours.pre && stamp < hours.opens) return 'PRE';
	if (stamp >= hours.opens && stamp < hours.closes) return 'REGULAR';
	if (stamp >= hours.closes && stamp < hours.post) return 'POST';
	if (stamp >= hours.post && stamp < hours.postpost) return 'POSTPOST';
	return 'CLOSED'
}


