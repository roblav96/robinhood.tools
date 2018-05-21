// 

import * as Vts from 'vue-property-decorator'
import { mixins as Mixins } from 'vue-class-component'
import Vue from 'vue'
import * as _ from '@/common/lodash'
import * as core from '@/common/core'
import * as pretty from '@/common/pretty'
import * as utils from '@/client/adapters/utils'



@Vts.Component
export default class extends Vue {

	env = process.env.NODE_ENV
	development = !!process.env.DEVELOPMENT
	production = !!process.env.PRODUCTION

	vtruncate(value: string, length = 64) { if (!value) return value; return _.truncate(value, { length }) }
	vcapitalize(value: string) { if (!value) return value; return core.string.capitalize(value) }
	vstamp(stamp: number) { if (!stamp) return stamp; return pretty.stamp(stamp) }
	vfromnow(stamp: number, opts: Partial<FromNowOpts>) { if (!stamp) return stamp; return pretty.fromNow(stamp, opts) }
	vnumber(value: number, opts: Partial<FormatNumberOpts>) { if (!Number.isFinite(value)) return value; return utils.number(value, opts) }
	vpercent(to: number, from: number) { if (!to || !from) return NaN; return core.calc.percent(to, from) }
	vslider(value: number, min: number, max: number) { if (!value) return NaN; return core.calc.slider(value, min, max) }
	vmarketcap(price: number, shares: number) { return price * shares }

	get recents() { return this.$store.state.recents }
	get breakpoints() { return this.$store.state.breakpoints }
	get rhusername() { return this.$store.state.security.rhusername }

	get routes() {
		return this.$router.options.routes.filter(function(route) {
			return route.title && route.icon
		})
	}

}


