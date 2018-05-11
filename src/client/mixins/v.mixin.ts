// 

import * as Vts from 'vue-property-decorator'
import { mixins as Mixins } from 'vue-class-component'
import Vue from 'vue'
import * as prettyms from 'pretty-ms'
import * as _ from '@/common/lodash'
import * as core from '@/common/core'
import * as pretty from '@/common/pretty'



@Vts.Component
export default class extends Vue {

	env = process.env.NODE_ENV
	development = !!process.env.DEVELOPMENT
	production = !!process.env.PRODUCTION

	vtruncate(value = '', length = 64) { return _.truncate(value, { length }) }
	vcapitalize(value = '') { return core.string.capitalize(_.startCase(value)) }
	vstamp(stamp: number) { return pretty.stamp(stamp) }
	vfromnow(stamp: number) { return pretty.fromNow(stamp) }

	vpercent(to: number, from: number) { return core.calc.percent(to, from) }
	vnumber(value: number, precision?: number) { return pretty.nfixed(value, { precision }) }
	vplusminus(value: number) { return pretty.nfixed(value, { plusminus: true }) }
	vcompact(value: number) { return pretty.nfixed(value, { compact: true }) }

}


