// 

import '@/common/clock'
import '@/client/ui/ui'
import * as security from '@/client/adapters/security'
import socket from '@/client/adapters/socket'
import router from '@/client/router'
import store from '@/client/store'
import App from '@/client/app/app'



(async function start() {
	await security.init()
	await socket.discover()
	await socket.toPromise('ready')
	vm.$mount('#app')
})()

const vm = new App({ router, store })
export default vm





