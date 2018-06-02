// 

import * as Vts from 'vue-property-decorator'
import { mixins as Mixins } from 'vue-class-component'
import Vue from 'vue'
import VMixin from '@/client/mixins/v.mixin'
import Symbol from './symbol'
import * as echarts from 'echarts'
import * as ecstat from 'echarts-stat'
import * as core from '@/common/core'
import * as rkeys from '@/common/rkeys'
import * as http from '@/client/adapters/http'



@Vts.Component
export default class extends Vue {
	$parent: Symbol
	symbol = this.$parent.symbol
	all = this.$parent.all
	busy = this.$parent.busy
	lbusy = true

	created() {
		this.getlives()
	}

	mounted() {
		let el = this.$el.querySelector('#chart_div') as HTMLElement
		console.log(`el -> %O`, el, el)
	}

	getlives() {
		this.lbusy = true
		return http.post('/quotes/lives', { symbols: [this.symbol] }).then((response: Quotes.Live[][]) => {
			console.log(`response ->`, JSON.parse(JSON.stringify(response)))
		}).catch(function(error) {
			console.error(`getlives Error -> %O`, error)
		}).finally(() => {
			return this.$nextTick(() => this.lbusy = false)
		})
	}

}


