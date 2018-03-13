// 

import * as eyes from 'eyes'
import * as clc from 'cli-color'
import * as _ from 'lodash'
import * as common from '../../common'
import * as utils from '../services/utils'

// import 'gun/nts'
import 'gun/lib/uws'
import * as Gun from 'gun/gun'



let stport = Number.parseInt(process.env.PORT) + process.INSTANCES + 2
let port = stport + process.INSTANCE
let host = 'ws://localhost:' + port + '/websocket'

// console.log('host >')
// eyes.inspect(host)

const gun = Gun(host)
// console.dir(gun)

gun.opt({

	peers: common.array.create(process.INSTANCES).filter(function(v) {
		return (stport + v) != port
	}).map(v => 'ws://localhost:' + (stport + v) + '/websocket'),

	uuid: function() {
		console.warn('uuid: function')
		return common.security.random(32)
	},

})



const greetings = gun.get('greetings')
greetings.put({ hello: common.security.random(16) })
greetings.on(function(data) {
	// console.log('greetings.on update >', data)
})



export default gun




