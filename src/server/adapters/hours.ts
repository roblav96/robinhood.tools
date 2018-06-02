// 

export * from '../../common/hours'
import * as schedule from 'node-schedule'
import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as Rx from '../../common/rxjs'
import * as rkeys from '../../common/rkeys'
import * as pretty from '../../common/pretty'
import * as hours from '../../common/hours'
import * as redis from './redis'
import radio from './radio'



export const rxhours = new Rx.BehaviorSubject(null as Hours)
export const rxstate = new Rx.BehaviorSubject(null as Hours.State)

radio.on('syncHours', syncHours)
schedule.scheduleJob('* * * * *', syncHours).invoke()

async function syncHours() {
	let rhours = await redis.main.hgetall(rkeys.HR.HOURS) as Hours
	if (Object.keys(rhours).length == 0) return;
	core.fix(rhours, true)
	if (!_.isEqual(rxhours.value, rhours)) rxhours.next(rhours);
	let state = hours.getState(rxhours.value)
	if (rxstate.value != state) rxstate.next(state);
}


