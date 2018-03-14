//

import chalk from 'chalk'
import * as eyes from 'eyes'
import * as _ from 'lodash'
import * as common from '../../common'

import * as rethinkdbdash from 'rethinkdbdash'



const r = rethinkdbdash({
	host: process.env.RETHINKDB_HOST,
	port: Number.parseInt(process.env.RETHINKDB_PORT),
	authKey: process.env.RETHINKDB_AUTHKEY,
	db: process.env.RETHINKDB_DB,
	silent: true,
	// discovery: true,
	// pingInterval: 1000,
	// log: function(message) { console.log(message) },
	// discovery: true,
}) as rethinkdbdash.RDash



// function ping() {
// 	let t = Date.now()
// 	return Promise.resolve().then(function() {
// 		return r.expr(1).run()
// 	}).then(function() {
// 		if (!utils.ready.r.value) {
// 			console.log('ping', Date.now() - t, 'ms')
// 			utils.ready.r.next(true)
// 		}
// 		return Promise.resolve()
// 	}).catch(function(error) {
// 		console.error('ping > error', error)
// 		return Promise.resolve()
// 	}).then(function() {
// 		return pevent(process.ee3, shared.enums.EE3.TICK_10)
// 	})
// }
// pforever(ping)



// const cleanup = _.once(function() { r.getPoolMaster().drain() })
// process.on('beforeExit', cleanup)
// process.on('exit', cleanup)



export default r





function __init() {

	/*████████████████████████████████████████
	█            TABLES & INDEXES            █
	████████████████████████████████████████*/



}








