// 

import '../common/polyfills'

import * as _ from 'lodash'
import * as Fastify from 'fastify'
const fastify = Fastify()
fastify.listen(_.random(12000, 12300), 'localhost', function(error) {
	if (error) return console.error(' \n \nlisten Error ->', error);
	console.info(' \n \nlisten ->', fastify.server.address().address + ':' + fastify.server.address().port, ' \n', fastify.printRoutes());
})





// import 'source-map-support/register'

// global.Promise = require('bluebird')
// global.WebSocket = require('uws')

// global.NODE_ENV = process.env.NODE_ENV || 'development'
// global.DEVELOPMENT = NODE_ENV == 'development'
// global.PRODUCTION = NODE_ENV == 'production'

// // console.log('process.env ->', process.env)

// import './process'
// import './adapters/console'
// import './adapters/redis'



// import '../common/clock'
// import './adapters/radio'
// // import './adapters/cluster'

// import './watchers/robinhood.instruments'
// import './watchers/webull.tickers'

// import './api/fastify'


