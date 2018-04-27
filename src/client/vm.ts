// 

import '@/common/clock'
import '@/client/adapters/security'
import '@/client/ui/ui'
import router from '@/client/router'
import store from '@/client/store'
import App from '@/client/app/app'




export default new App({ router, store }).$mount('#app')




