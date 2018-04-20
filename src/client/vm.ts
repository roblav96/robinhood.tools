// 

import '@/common/clock'
import '@/client/services/security'
import '@/client/svgs/svgs'
import router from '@/client/router'
import store from '@/client/store'
import App from '@/client/app/app'



export default new App({ router, store }).$mount('#app')




