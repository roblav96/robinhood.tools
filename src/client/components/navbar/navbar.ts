// 

import * as Vts from 'vue-property-decorator'
import { mixins as Mixins } from 'vue-class-component'
import Vue from 'vue'
import VMixin from '@/client/mixins/v.mixin'
import * as _ from '@/common/lodash'
import * as pretty from '@/common/pretty'
import dayjs from '@/common/dayjs'
import clock from '@/common/clock'



@Vts.Component({
	components: {
		'v-searchbar': () => import('@/client/components/searchbar/searchbar'),
	},
})
export default class extends Mixins(VMixin) {

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
		if (state == 'REGULAR') return 'is-success';
		if (state.includes('PRE') || state.includes('POST')) return 'is-warning';
		return 'is-danger'
	}
	onsecond() { this.time = dayjs().format('h:mm:ssa') }

	get routes() {
		return this.$router.options.routes.filter(function(route) {
			return route.title && route.icon
		})
	}

	get equity() { return _.sum(this.$store.state.rh.portfolios.map(v => v.extended_hours_equity || v.equity)) }
	get equitychange() { return _.sum(this.$store.state.rh.portfolios.map(v => v.extended_hours_equity || v.equity)) }
	get equitypercent() { return _.sum(this.$store.state.rh.portfolios.map(v => v.extended_hours_equity || v.equity)) }
	// get market() { return _.sum(this.$store.state.rh.portfolios.map(v => v.extended_hours_market_value || v.market_value)) }
	// get funds() { return _.sum(this.$store.state.rh.accounts.map(v => v.buying_power)) }

}


