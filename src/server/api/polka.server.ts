// 

import * as _ from '../../common/lodash'
import * as exithook from 'exit-hook'
import * as turbo from 'turbo-http'
import polka from './polka'



const server = turbo.createServer(polka.handler)
export default server

server.listen(+process.env.IPORT, process.env.HOST, function onlisten() {
	console.info('turbo listening ->', process.env.HOST + ':' + process.env.IPORT)
})

exithook(function onexit() {
	server.connections.forEach(v => v.close())
	server.close()
})


