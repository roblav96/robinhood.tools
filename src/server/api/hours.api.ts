// 

import * as _ from '../../common/lodash'
import * as rkeys from '../../common/rkeys'
import * as hours from '../adapters/hours'
import polka from './polka'



polka.route({
	method: 'GET',
	url: '/api/hours',
	handler(req, res) { return { hours: hours.rxhours.value, state: hours.rxstate.value } }
})


