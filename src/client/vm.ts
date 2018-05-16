// 

import '@/common/clock'
import '@/client/ui/directives'
import '@/client/ui/components'
import '@/client/adapters/robinhood'
import * as security from '@/client/adapters/security'
import socket from '@/client/adapters/socket'
import router from '@/client/router'
import store from '@/client/store'
import App from '@/client/app/app'



const vm = new App({ router, store })
export default vm



Promise.resolve().then(function() {
	return security.token()
}).then(function() {
	return Promise.all([
		socket.discover(),
		socket.toPromise('ready'),
	])
}).catch(function(error) {
	console.error('vm Error ->', error)
}).finally(function() {
	vm.$mount('#app')
})



// import pAll from 'p-all'
// pAll([
// 	() => security.token(),
// 	() => socket.discover(),
// 	() => socket.toPromise('ready'),
// ], { concurrency: 1 }).catch(error => {
// 	console.error('pAll init Error ->', error)
// }).finally(() => { vm.$mount('#app') })


