// 

import * as Vts from 'vue-property-decorator'
import { mixins as Mixins } from 'vue-class-component'
import Vue from 'vue'
import * as _ from '@/common/lodash'
import * as core from '@/common/core'
import * as pretty from '@/common/pretty'
import * as robinhood from '@/client/adapters/robinhood'
import store from '@/client/store'



@Vts.Component
export default class extends Vue {

	get rh() { return this.$store.state.rh }

	get equityvalue() { return _.sum(this.rh.portfolios.map(v => v.extended_hours_equity || v.equity)) }
	get equityprev() { return _.sum(this.rh.portfolios.map(v => v.adjusted_equity_previous_close || v.equity_previous_close)) }
	get equitychange() { return this.equityvalue - this.equityprev }
	get equitypercent() { return core.calc.percent(this.equityvalue, this.equityprev) }

	get marketvalue() { return _.sum(this.rh.portfolios.map(v => v.extended_hours_market_value || v.market_value)) }
	get cashvalue() { return _.sum(this.rh.accounts.map(v => v.cash)) }
	get buyingpower() { return _.sum(this.rh.accounts.map(v => v.buying_power)) }

}


