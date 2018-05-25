// 

import { Server as TurboServer } from 'turbo-http'
import * as TurboRequest from 'turbo-http/lib/request'
import * as TurboResponse from 'turbo-http/lib/response'
import * as turbo from 'turbo-http'
import * as Polka from 'polka'
import * as _ from 'lodash'



const polka = Polka<TurboServer, TurboRequest, TurboResponse>({

})

const server = turbo.createServer(polka.handler)
server.listen(_.random(8000, 9000), process.env.HOST, () => {
	let address = server.address()
	console.info('api listening ->', address.port)
	process.send('ready')
})

polka.get('/', (req, res) => {
	res.end('OK')
})

let ii = 0
setInterval(function() {
	console.log(`ii++ ->`, ii++)
}, 1000)


