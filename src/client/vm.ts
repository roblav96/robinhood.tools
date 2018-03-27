// 

import '@/common/ticks'
import router from '@/client/router'
import store from '@/client/store'
import App from '@/client/app/app'



export default new App({ router, store }).$mount('#app')



import uWebSocket from '@/common/uwebsocket'

let address = process.DOMAIN.replace('http', 'ws')
console.log('address ->', address)
let socket = new uWebSocket(WebSocket as any, address)


