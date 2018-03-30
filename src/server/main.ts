// 
import './process'
// 

import '../common/ticks'
import './adapters/redis'
import './adapters/logger'
import './services/devtools'
import './services/radio'

if (process.WORKER) {
	require('./api/fastify')
}


