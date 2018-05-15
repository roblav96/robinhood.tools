// 

import '@/common/clock'
import '@/client/ui/directives'
import '@/client/ui/components'
import * as security from '@/client/adapters/security'
import * as robinhood from '@/client/adapters/robinhood'
import socket from '@/client/adapters/socket'
import router from '@/client/router'
import store from '@/client/store'
import App from '@/client/app/app'
import pAll from 'p-all'



pAll([
	() => security.token(),
	() => robinhood.sync(),
	() => socket.discover(),
	() => socket.toPromise('ready'),
], { concurrency: 1 }).catch(error => {
	console.error('pAll init Error ->', error)
}).finally(() => { vm.$mount('#app') })

const vm = new App({ router, store })
export default vm





