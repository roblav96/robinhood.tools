// 

import * as schedule from 'node-schedule'
export * from '../../common/hours'
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
export const rxprevhours = new Rx.BehaviorSubject(null as Hours)
export const rxnexthours = new Rx.BehaviorSubject(null as Hours)

radio.on('syncHours', syncHours)
schedule.scheduleJob('* * * * *', syncHours).invoke()

async function syncHours() {
	let resolved = await redis.main.coms([
		['hgetall', rkeys.HR.HOURS],
		['hgetall', rkeys.HR.PREV_HOURS],
		['hgetall', rkeys.HR.NEXT_HOURS],
	]) as Hours[]
	if (Object.keys(resolved[0]).length > 0) {
		core.fix(resolved[0])
		if (!_.isEqual(rxhours.value, resolved[0])) rxhours.next(resolved[0]);
		let state = hours.getState(rxhours.value)
		if (rxstate.value != state) rxstate.next(state);
	}
	if (Object.keys(resolved[1]).length > 0) {
		core.fix(resolved[1])
		if (!_.isEqual(rxprevhours.value, resolved[1])) rxprevhours.next(resolved[1]);
	}
	if (Object.keys(resolved[2]).length > 0) {
		core.fix(resolved[2])
		if (!_.isEqual(rxnexthours.value, resolved[2])) rxnexthours.next(resolved[2]);
	}
}


