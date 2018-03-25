// 

process.INSTANCES = 0

process.BONE_MEMORY = process.memoryUsage()
import './_process'
process.PROC_MEMORY = process.memoryUsage()

// 

import * as eyes from 'eyes'
import * as _ from 'lodash'



import './services/ticks'
import './services/dev'
import './services/radio'



if (process.WORKER) {
	import('./fastify')
}


