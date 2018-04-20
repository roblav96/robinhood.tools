// 

import '@/common/clock'
import '@/client/services/security'
import router from '@/client/router'
import store from '@/client/store'
import App from '@/client/app/app'



const app = new App({ router, store }).$mount('#app')
export default app


