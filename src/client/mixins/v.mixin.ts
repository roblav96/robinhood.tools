// 

import * as Vts from 'vue-property-decorator'
import { mixins as Mixins } from 'vue-class-component'
import Vue from 'vue'
import * as _ from '@/common/lodash'
import * as core from '@/common/core'
import * as pretty from '@/common/pretty'



@Vts.Component
export default class extends Vue {

	env = process.env.NODE_ENV
	development = !!process.env.DEVELOPMENT
	production = !!process.env.PRODUCTION

	vtruncate(value: string, length = 64) { if (!value) return value; return _.truncate(value, { length }) }
	vcapitalize(value: string) { if (!value) return value; return core.string.capitalize(_.startCase(value)) }
	vstamp(stamp: number) { if (!stamp) return stamp; return pretty.stamp(stamp) }
	vfromnow(stamp: number, opts: Partial<FromNowOpts>) { if (!stamp) return stamp; return pretty.fromNow(stamp, opts) }
	vnumber(value: number, opts: Partial<FormatNumberOpts>) { if (!Number.isFinite(value)) return value; return pretty.number(value, opts) }
	vpercent(to: number, from: number) { if (!to || !from) return 'NaN'; return core.calc.percent(to, from) }
	vslider(value: number, min: number, max: number) { if (!value) return 'NaN'; return core.calc.slider(value, min, max) }

}


