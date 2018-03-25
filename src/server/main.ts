// 
import './_process'
// 

import * as eyes from 'eyes'
import * as _ from 'lodash'



import './services/ticks'
import './services/dev'
// import './services/radio'

if (process.WORKER) {
	import('./fastify')
}


