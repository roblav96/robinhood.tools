// 

import '@/common/ticks'
import router from '@/client/router'
import store from '@/client/store'
import App from '@/client/app/app'
import '@/client/adapters/socket'



export default new App({ router, store }).$mount('#app')






