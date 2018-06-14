// 

import * as Vts from 'vue-property-decorator'
import * as Vcc from 'vue-class-component'
import { mixins as Mixins } from 'vue-class-component'
import Vue from 'vue'
import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as utils from '../adapters/utils'
import * as pretty from '../adapters/pretty'



@Vts.Component
export default class VMixin extends Vue {

	static NoCache = Vcc.createDecorator((options, key, index) => {
		(options.computed[key] as any).cache = false
	})

	env = process.env.NODE_ENV
	development = !!process.env.DEVELOPMENT
	production = !!process.env.PRODUCTION

	@VMixin.NoCache get $destroyed() { return this._isDestroyed }
	$safety() { if (this.$destroyed) throw new Error('$safety'); }

	vcamel(value: string) { return _.camelCase(value) }
	vstcase(value: string) { return _.startCase(value) }
	vtruncate(value: string, length = 48) { if (!value) return value; return _.truncate(value, { length }) }
	vcapitalize(value: string) { if (!value) return value; return core.string.capitalize(value) }
	vstamp(stamp: number) { if (!stamp) return stamp; return pretty.stamp(stamp) }
	vtime(stamp: number, opts?: Partial<TimeFormatOptions>) { if (!stamp) return stamp; return pretty.time(stamp, opts) }
	nformat(value: number, opts?: Partial<NumberFormatOptions>) { if (!Number.isFinite(value)) return value; return pretty.number(value, opts) }
	vpercent(to: number, from: number) { if (!to || !from) return NaN; return core.calc.percent(to, from) }
	vslider(value: number, min: number, max: number) { if (!value) return NaN; return core.calc.slider(value, min, max) }

	breakpoints = this.$store.state.breakpoints
	colors = this.$store.state.colors
	hours = this.$store.state.hours
	recents = this.$store.state.recents
	rhusername = this.$store.state.security.rhusername

}


