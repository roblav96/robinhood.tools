// 

import * as _ from 'lodash'
import * as common from '@/common'
import Gun from 'gun/gun'



let host = process.env.DOMAIN + '/websocket'
console.warn('host', host)

const gun = Gun(host)
// console.log('gun', gun)

const greetings = gun.get('greetings')
greetings.put({ hello: common.security.random(16) })
greetings.on(function(data) {
	console.log('greetings.on update >', data)
})



export default gun


