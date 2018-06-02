// 

import * as Vts from 'vue-property-decorator'
import { mixins as Mixins } from 'vue-class-component'
import Vue from 'vue'
import VMixin from '@/client/mixins/v.mixin'
import Symbol from './symbol'
import * as echarts from 'echarts'
import * as ecstat from 'echarts-stat'
import * as _ from '@/common/lodash'
import * as core from '@/common/core'
import * as rkeys from '@/common/rkeys'
import * as http from '@/client/adapters/http'



@Vts.Component({
	template: `<div class="flex-col-full w-full h-full"></div>`,
})
class VSymbolEChart extends Vue {
	$parent: VSymbolChart
	symbol = this.$parent.symbol

	echart: echarts.ECharts
	dims = {} as echarts.Dims

	created() {

	}

	mounted() {
		this.echart = echarts.init(this.$el)
		window.addEventListener('resize', this.onresize.bind(this), { passive: true })
		this.resize()
	}

	beforeDestroy() {
		console.warn(`beforeDestroy`)
		this.echart.clear()
		this.echart.dispose()
		this.echart = null
		window.removeEventListener('resize', this.onresize)
		console.log(`windodw -> %O`, window, window)
	}
	
	destroyed() {
		console.warn(`destroyeddd`)
	}

	onresize = _.debounce(this.resize, 100, { leading: false, trailing: true })
	resize() {
		this.dims = { width: this.$el.offsetWidth, height: this.$el.offsetHeight }
		console.log(`this.dims ->`, JSON.parse(JSON.stringify(this.dims)))
		this.echart.resize(this.dims)
	}

}



@Vts.Component({
	components: { 'v-symbol-echart': VSymbolEChart },
})
export default class VSymbolChart extends Vue {
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


