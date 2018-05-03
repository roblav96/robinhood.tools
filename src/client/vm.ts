// 

import '@/common/clock'
import '@/client/adapters/security'
import '@/client/ui/ui'
import router from '@/client/router'
import store from '@/client/store'
import App from '@/client/app/app'



const vm = new App({ router, store })
vm.$mount('#app')
export default vm


