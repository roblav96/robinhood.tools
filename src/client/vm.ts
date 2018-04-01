// 
import { noop } from 'lodash'
let dtsgen = noop
// /**▶ UNCOMMENT TO ENABLE */ if (DEVELOPMENT) dtsgen = require('@/common/dtsgen').default;
Object.assign(console, { dtsgen })
// 

import '@/common/ticks'
import '@/client/services/security'
import router from '@/client/router'
import store from '@/client/store'
import App from '@/client/app/app'



export default new App({ router, store }).$mount('#app')






