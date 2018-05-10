// 

import * as Vts from 'vue-property-decorator'
import { mixins as Mixins } from 'vue-class-component'
import Vue from 'vue'
import * as _ from '@/common/lodash'



@Vts.Component
export default class extends Vue {

	env = process.env.NODE_ENV
	development = process.env.DEVELOPMENT
	production = process.env.PRODUCTION

	vtruncate(input: string, length = 64) { return _.truncate(input, { length }) }
	vstartcase(input: string) { return _.startCase(input) }



}


