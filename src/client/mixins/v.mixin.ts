//

import * as Vts from 'vue-property-decorator'
import * as Vcc from 'vue-class-component'
import { mixins as Mixins } from 'vue-class-component'
import Vue from 'vue'
import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as quotes from '../../common/quotes'
import * as utils from '../adapters/utils'
import * as pretty from '../adapters/pretty'

@Vts.Component
export default class VMixin extends Vue {
	static NoCache = Vcc.createDecorator((options, key, index) => {
		;(options.computed[key] as any).cache = false
	})

	env = process.env.NODE_ENV
	development = !!process.env.DEVELOPMENT
	production = !!process.env.PRODUCTION

	@VMixin.NoCache get $destroyed() {
		return this._isDestroyed
	}
	$safety() {
		if (this.$destroyed) throw new Error('$safety')
	}

	get $routerSymbolName() {
		return this.$route.name.startsWith('symbol.') ? this.$route.name : 'symbol'
	}

	vcamel(value: string) {
		return _.camelCase(value)
	}
	vstcase(value: string) {
		return _.startCase(value.toLowerCase())
	}
	vtruncate(value: string, length = 48) {
		return _.truncate(value, { length })
	}
	vcapitalize(value: string) {
		return core.string.capitalize(value)
	}
	vstamp(stamp: number) {
		return stamp && pretty.stamp(stamp)
	}
	vname(name: string) {
		return name && quotes.getName(name)
	}
	vtime(stamp: number, opts?: Partial<Pretty.TimeFormatOptions>) {
		return stamp && pretty.time(stamp, opts)
	}
	vnumber(value: number, opts?: Partial<Pretty.NumberFormatOptions>) {
		if (!Number.isFinite(value)) return value
		return pretty.number(value, opts)
	}
	vpercent(to: number, from: number) {
		if (!to || !from) return NaN
		return core.calc.percent(to, from)
	}
	vslider(value: number, min: number, max: number) {
		if (!value) return NaN
		return core.calc.slider(value, min, max)
	}

	breakpoints = this.$store.state.breakpoints
	theme = this.$store.state.colors.theme
	hours = this.$store.state.hours
	rhusername = this.$store.state.security.rhusername
}
