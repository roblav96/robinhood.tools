// 

import * as Vts from 'vue-property-decorator'
import { mixins as Mixins } from 'vue-class-component'
import Vue from 'vue'
import * as _ from '@/common/lodash'



@Vts.Component
export default class extends Vue {

	v_env = process.env.NODE_ENV
	v_development = process.env.DEVELOPMENT
	v_production = process.env.PRODUCTION

	v_truncate(input: string, length = 64) { return _.truncate(input, { length }) }



}


