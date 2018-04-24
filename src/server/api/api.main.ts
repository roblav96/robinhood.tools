// 

import '../main'
import * as pandora from 'pandora'
import polka from './polka.api'
import './socket.api'



setImmediate(async function() {
	await polka.listen(+process.env.PORT, process.env.HOST)
	console.info('polka listening ->', process.env.HOST + ':' + process.env.PORT)
})

process.on('SIGTERM', function() {
	polka.server.connections.forEach(v => v.close())
	polka.server.close()
})


