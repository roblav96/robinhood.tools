// 
import './process'
// 

import '../common/ticks'
import './adapters/redis'
import './services/radio'

if (process.WORKER) {
	require('./api/fastify')
}


