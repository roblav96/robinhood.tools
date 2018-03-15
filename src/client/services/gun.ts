// 

import * as _ from 'lodash'
import * as common from '@/common'

import * as Gun from 'gun/gun'
import 'gun/nts'
import 'gun/lib/ws'
// import 'gun/lib/wire'



const gun = new Gun({
	localStorage: false,
	peers: common.array.create(8).map(i => 'ws://dev.robinhood.tools/websocket/' + i),
})
// const gun = new Gun('ws://dev.robinhood.tools/websocket/0')
// const gun = new Gun('ws://localhost:12210/gun')
// const gun = new Gun({
// host: 'localhost',
// port: 12210,
// path: 'gun',
// })

console.log('gun >', gun)
console.log('gun._.opt >', gun._.opt)



common.DEV_SYMBOLS.forEach(function(fsymbol) {
	gun.get('quotes/' + fsymbol.symbol).on(function(data, key) {
		console.log(key, 'on >', JSON.stringify(_.omit(data, ['_']), null, 4))
	}, { change: true })
})

// const quotes = gun.get('quotes/SPY')
// quotes.on(function(data, key) {
// 	console.log('gun on >', key, JSON.stringify(data, null, 4))
// }, { change: true })

// gun.on(function(data, key) {
// 	console.log('gun on >', key, JSON.stringify(data, null, 4))
// })



// const greetings = gun.get('greetings')
// greetings.put({ client: common.security.random(8) })
// // greetings.put({ [common.security.random(4)]: common.security.random(8) })
// greetings.on(function(data) {
// 	console.log('greetings.on update >', JSON.stringify(data, null, 4))
// })



export default gun




