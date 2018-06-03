// 

import * as Vts from 'vue-property-decorator'
import { mixins as Mixins } from 'vue-class-component'
import Vue from 'vue'
import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as pretty from '../../common/pretty'
import * as utils from '../adapters/utils'



@Vts.Component
export default class extends Vue {

	env = process.env.NODE_ENV
	development = !!process.env.DEVELOPMENT
	production = !!process.env.PRODUCTION

	vcamel(value: string) { return _.camelCase(value) }
	vscase(value: string) { return _.startCase(value) }
	vtruncate(value: string, length = 64) { if (!value) return value; return _.truncate(value, { length }) }
	vcapitalize(value: string) { if (!value) return value; return core.string.capitalize(value) }
	vstamp(stamp: number) { if (!stamp) return stamp; return pretty.stamp(stamp) }
	vfromnow(stamp: number, opts?: Partial<VFromNowOpts>) { if (!stamp) return stamp; return utils.vfromnow(stamp, opts) }
	vnumber(value: number, opts?: Partial<VNumberOpts>) { if (!Number.isFinite(value)) return value; return utils.vnumber(value, opts) }
	vpercent(to: number, from: number) { if (!to || !from) return NaN; return core.calc.percent(to, from) }
	vslider(value: number, min: number, max: number) { if (!value) return NaN; return core.calc.slider(value, min, max) }

	breakpoints = this.$store.state.breakpoints
	colors = this.$store.state.colors
	hours = this.$store.state.hours
	recents = this.$store.state.recents
	rhusername = this.$store.state.security.rhusername

}


