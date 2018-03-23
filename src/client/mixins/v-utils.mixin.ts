// 

import * as Vts from 'vue-property-decorator'
import { mixins as Mixins } from 'vue-class-component'
import Vue from 'vue'
import _ from 'lodash'



@Vts.Component
export default class extends Vue {

	v_env = NODE_ENV
	v_development = DEVELOPMENT
	v_production = PRODUCTION

	v_truncate(input: string, length = 64) {
		return _.truncate(input, { length })
	}



}


