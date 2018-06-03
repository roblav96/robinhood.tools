// 

import * as Vts from 'vue-property-decorator'
import { mixins as Mixins } from 'vue-class-component'
import Vue from 'vue'
import VMixin from '../../mixins/v.mixin'
import RHMixin from '../../mixins/robinhood.mixin'
import * as _ from '../../../common/lodash'
import * as core from '../../../common/core'
import * as pretty from '../../../common/pretty'
import * as rkeys from '../../../common/rkeys'
import * as robinhood from '../../adapters/robinhood'
import * as security from '../../adapters/security'
import * as http from '../../../common/http'
import store from '../../store'
import socket from '../../adapters/socket'



@Vts.Component({
	beforeRouteEnter(to, from, next) {
		// if (process.env.DEVELOPMENT) return next();
		store.state.security.rhusername ? next() : next({ name: 'login' })
	},
})
export default class extends Mixins(VMixin, RHMixin) {

	get routes() { return this.$router.options.routes.find(v => v.name == 'robinhood').children }

}


