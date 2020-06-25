//

import * as Vts from 'vue-property-decorator'
import { mixins as Mixins } from 'vue-class-component'
import Vue from 'vue'
import VMixin from '../../mixins/v.mixin'
import RHMixin from '../../mixins/robinhood.mixin'
import * as dayjs from 'dayjs'
import * as _ from '../../../common/lodash'
import * as pretty from '../../adapters/pretty'
import * as utils from '../../adapters/utils'
import clock from '../../../common/clock'

@Vts.Component({
	components: {
		'v-searchbar': () => import('../searchbar/searchbar'),
		'v-navticker': () => import('../navticker/navticker'),
	},
})
export default class extends Mixins(VMixin, RHMixin) {
	created() {
		document.documentElement.classList.add('has-navbar-fixed-top')
		this.$router.afterEach(() => (this.mobilemenu = false))
		clock.on('1s', this.onsec)
		this.onsec()
	}
	beforeDestroy() {
		clock.offListener(this.onsec)
	}

	time = ''
	onsec() {
		this.time = dayjs().format('h:mm:ssa')
	}

	get state() {
		return pretty.marketState(this.hours.state)
	}
	get colorstate() {
		let state = this.hours.state || ''
		if (state == 'REGULAR') return 'has-text-success'
		if (state.includes('PRE') || state.includes('POST')) return 'has-text-warning'
		return 'has-text-lighter'
	}

	isroute(name: string) {
		return name == this.$route.name
	}
	get routes() {
		return this.$router.options.routes.filter((v) => v.meta && v.meta.icon)
	}

	mobilemenu = false
	@Vts.Watch('mobilemenu') w_mobilemenu(mobilemenu: boolean) {
		this.$store.state.backdrop = mobilemenu
	}
	@Vts.Watch('$store.state.backdrop') w_backdrop(backdrop: boolean) {
		if (this.mobilemenu && !backdrop) this.mobilemenu = backdrop
	}
	@Vts.Watch('breakpoints.name') w_breakpointsname(to: string) {
		if (this.mobilemenu && this.breakpoints.desktopAndUp) this.mobilemenu = false
	}
}
