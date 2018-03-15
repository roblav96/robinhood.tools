// 

import chalk from 'chalk'
import * as eyes from 'eyes'
import * as _ from 'lodash'
import * as common from '../../common'
import * as utils from '../services/utils'

import * as Gun from 'gun/gun'
import 'gun/nts'
import 'gun/lib/wire'
// import 'gun/lib/ws'
// import 'gun/lib/store'
import fastify from '../fastify'



const gun = new Gun({
	localStorage: false,
	file: 'dist/radata',
	web: fastify.server,
	ws: { path: '/websocket/' + process.INSTANCE },
	uuid: 'uuid_' + process.INSTANCE,
	peers: common.array.create(process.INSTANCES).filter(function(i) {
		return i != process.INSTANCE
	}).map(i => 'ws://localhost:' + (process.PORT + i) + '/websocket/' + i),
	// }).map(i => 'ws://localhost:' + (process.PORT + i) + '/gun'),
	// }).map(i => 'ws://dev.robinhood.tools/websocket/' + i),
})

if (process.PRIMARY) {
	setTimeout(function() {
		console.log('gun._.opt.peers >', gun._.opt.peers)
		// Object.keys(gun._.opt.peers).forEach(function (key) {
		// 	let peer = gun._.opt.peers[key]
		// 	console.log(key + ' peer.wire >', !!peer.wire)
		// })
	}, 3000)
}



export default gun







// const gun = new Gun('http://localhost:12201/gun')
// setTimeout(function() {
// 	// console.info('gun._.opt >')
// 	// eyes.inspect(gun._.opt)
// 	console.log('gun._.opt >', gun._.opt)
// }, 3000)

// const greetings = gun.get('greetings')
// greetings.put({ ['i_' + process.INSTANCE]: common.security.random(8) })
// greetings.on(function(data) {
// 	console.log('greetings.on update >', data)
// })



// let host = 'ws://localhost:' + (process.PORT + 2) + '/gun'
// console.log('host >', host)

// // const gun = new Gun()
// const gun = new Gun(host)
// // const gun = new Gun({
// // 	file: 'dist/gun.data.' + process.INSTANCE + '.json',
// // 	// web: server.server,
// // })

// // console.log('gun >', gun)
// // console.info('gun >')
// // eyes.inspect(gun)

// // gun.wsp(server.server)


// // let stport = process.PORT + process.INSTANCES + 2
// // let port = stport + process.INSTANCE
// // let host = 'ws://localhost:' + port + '/gun'
// // // console.log('host >', host)

// // const gun = new Gun({
// // 	host: 'localhost',
// // 	port: port,
// // 	path: 'gun',
// // 	// localStorage: false,
// // 	// file: 'dist/gun.data.' + process.INSTANCE + '.json',
// // 	uuid: function() {
// // 		console.warn('uuid: function')
// // 		return common.security.random(32)
// // 	},
// // })

// // gun.opt({

// // 	peers: common.array.create(process.INSTANCES).filter(function(v) {
// // 		return (stport + v) != port
// // 	}).map(v => 'http://localhost:' + (stport + v) + '/gun'),

// // 	uuid: function() {
// // 		console.warn('uuid: function')
// // 		return common.security.random(32)
// // 	},

// // 	file: 'dist/gun.data.' + process.INSTANCE + '.json',

// // })



// const greetings = gun.get('greetings')
// greetings.put({ hello: common.security.random(32) })
// greetings.on(function(data) {
// 	console.log('greetings.on update >', data)
// })



// export default gun


