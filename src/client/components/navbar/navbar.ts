// 

import * as Vts from 'vue-property-decorator'
import { mixins as Mixins } from 'vue-class-component'
import Vue from 'vue'
import VMixin from '@/client/mixins/v.mixin'
import RHMixin from '@/client/mixins/robinhood.mixin'
import * as _ from '@/common/lodash'
import * as pretty from '@/common/pretty'
import dayjs from '@/common/dayjs'
import clock from '@/common/clock'



@Vts.Component({
	components: {
		'v-searchbar': () => import('@/client/components/searchbar/searchbar'),
	},
})
export default class extends Mixins(VMixin, RHMixin) {

	isMobileMenu = false

	created() {
		this.$router.afterEach(() => this.isMobileMenu = false)
		document.documentElement.classList.add('has-navbar-fixed-top')
		clock.on('1s', this.onsecond)
		this.onsecond()
	}

	get rhusername() { return this.$store.state.security.rhusername }

	time = ''
	get state() { return pretty.marketState(this.$store.state.hours.state) }
	get scolor() {
		let state = this.$store.state.hours.state
		if (state == 'REGULAR') return 'has-text-success';
		if (state.includes('PRE') || state.includes('POST')) return 'has-text-warning';
		return 'has-text-danger'
	}
	onsecond() { this.time = dayjs().format('h:mm:ssa') }

	get routes() {
		return this.$router.options.routes.filter(function(route) {
			return route.title && route.icon
		})
	}

}


