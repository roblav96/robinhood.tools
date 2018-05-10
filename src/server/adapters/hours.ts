// 

import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as Rx from '../../common/rxjs'
import * as rkeys from '../../common/rkeys'
import * as pretty from '../../common/pretty'
import * as schedule from 'node-schedule'
import * as pandora from './pandora'
import * as redis from './redis'



export const rxhours = new Rx.BehaviorSubject(null as Hours)
export const rxstate = new Rx.BehaviorSubject(null as Hours.State)

async function syncHours() {
	let hours = await redis.main.hgetall(rkeys.HR.HOURS) as Hours
	if (_.isEmpty(hours)) return;
	core.fix(hours)
	if (!_.isEqual(rxhours.value, hours)) rxhours.next(hours);
	let state = getState()
	if (rxstate.value != state) rxstate.next(state);
}
pandora.on('syncHours', syncHours)
schedule.scheduleJob('* * * * *', syncHours).invoke()

function getState(stamp = Date.now()): Hours.State {
	let hours = rxhours.value
	if (hours.openToday == false) return 'CLOSED';
	if (stamp >= hours.prepre && stamp < hours.pre) return 'PREPRE';
	if (stamp >= hours.pre && stamp < hours.opens) return 'PRE';
	if (stamp >= hours.opens && stamp < hours.closes) return 'REGULAR';
	if (stamp >= hours.closes && stamp < hours.post) return 'POST';
	if (stamp >= hours.post && stamp < hours.postpost) return 'POSTPOST';
	return 'CLOSED'
}


