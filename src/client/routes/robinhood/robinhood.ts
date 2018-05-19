// 

import * as Vts from 'vue-property-decorator'
import { mixins as Mixins } from 'vue-class-component'
import Vue from 'vue'
import VMixin from '@/client/mixins/v.mixin'
import RHMixin from '@/client/mixins/robinhood.mixin'
import * as _ from '@/common/lodash'
import * as core from '@/common/core'
import * as pretty from '@/common/pretty'
import * as rkeys from '@/common/rkeys'
import * as robinhood from '@/client/adapters/robinhood'
import * as security from '@/client/adapters/security'
import * as http from '@/client/adapters/http'
import store from '@/client/store'
import socket from '@/client/adapters/socket'



@Vts.Component({
	beforeRouteEnter(to, from, next) {
		// if (process.env.DEVELOPMENT) return next();
		store.state.security.rhusername ? next() : next({ name: 'login' })
	},
})
export default class extends Mixins(VMixin, RHMixin) {

	get routes() { return this.$router.options.routes.find(v => v.name == 'robinhood').children }

}


