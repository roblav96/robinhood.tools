// 

import * as Vts from 'vue-property-decorator'
import { mixins as Mixins } from 'vue-class-component'
import Vue from 'vue'
import * as _ from '@/common/lodash'



@Vts.Component
export default class extends Vue {

	v_env = NODE_ENV
	v_development = DEVELOPMENT
	v_production = PRODUCTION

	v_truncate(input: string, length = 64) { return _.truncate(input, { length }) }

	get v_routes() {
		return this.$router.options.routes.filter(function(route) {
			return route.title && !route.dev
		})
	}



}


