// 

import * as Vts from 'vue-property-decorator'
import { mixins as Mixins } from 'vue-class-component'
import Vue from 'vue'
import VMixin from '../../mixins/v.mixin'
import Symbol from './symbol'
import * as echarts from 'echarts'
import * as ecstat from 'echarts-stat'
import * as _ from '../../../common/lodash'
import * as core from '../../../common/core'
import * as rkeys from '../../../common/rkeys'
import * as quotes from '../../../common/quotes'
import * as yahoo from '../../../common/yahoo'
import * as http from '../../../common/http'
import * as utils from '../../adapters/utils'



@Vts.Component({
	template: `<div class="flex-col-full"></div>`,
})
class VSymbolEChart extends Vue {

	$parent: VSymbolChart
	echart: echarts.ECharts
	colors = this.$store.state.colors

	mounted() {
		this.echart = echarts.init(this.$el)
		this.echart.on('click', this.onevent)
		this.echart.on('dblclick', this.onevent)
		utils.wemitter.on('resize', this.onresize, this)
		this.resize()
	}

	beforeDestroy() {
		utils.wemitter.off('resize', this.onresize, this)
		this.onresize.cancel()
		this.echart.off('click')
		this.echart.off('dblclick')
		this.echart.clear()
		this.echart.dispose()
		this.echart = null
	}

	onevent(param: echarts.EventParam) {
		console.log(`param ->`, param)
	}

	dims() { return { width: this.$el.offsetWidth, height: this.$el.offsetHeight } as echarts.Dims }
	onresize = _.debounce(this.resize, 300)
	resize() {
		// let navbar = document.getElementById('navbar')
		// let header = document.getElementById('symbol_route').firstChild as HTMLElement
		// let screen = utils.screen()
		let dims = this.dims()
		// dims.height = screen.height - navbar.offsetHeight - header.offsetHeight
		this.echart.resize(dims)
		console.log(`this.colors ->`, JSON.stringify(this.colors, null, 4))
	}

	syncdataset(lquotes: Quotes.Live[]) {
		// let data = lquotes.map(v => {
		// 	return [v.timestamp, v.open, v.high, v.low, v.close, v.size]
		// })
		let bones = {
			animation: false,
			backgroundColor: 'white',
			dataset: {
				// dimensions: ['timestamp',''],
				source: lquotes,
				// source: data,
			},
			grid: [{
				top: 10,
				bottom: 125,
				left: 50,
				right: 50,
			}, {
				height: 50,
				left: 50,
				right: 50,
				bottom: 50,
			}],
			tooltip: {
				trigger: 'axis',
				axisPointer: {
					type: 'line',
				},
			},
			xAxis: [{
				type: 'category',
				scale: true,
				boundaryGap: false,
			}, {
				type: 'category',
				gridIndex: 1,
				scale: true,
				boundaryGap: false,
				axisLabel: { show: false },
				axisLine: { show: false },
				axisTick: { show: false },
				splitLine: { show: false },
				splitArea: { show: false },
			}],
			yAxis: [{
				scale: true,
				splitArea: { show: false },
			}, {
				scale: true,
				gridIndex: 1,
				axisLabel: { show: false },
				axisLine: { show: false },
				axisTick: { show: false },
				splitLine: { show: false },
				splitArea: { show: false },
			}],
			dataZoom: [{
				type: 'inside',
				xAxisIndex: [0, 1],
			}, {
				show: true,
				xAxisIndex: [0, 1],
				type: 'slider',
				bottom: 10,
				handleIcon: 'M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
			}],
			series: [{
				name: 'OHLC',
				type: 'candlestick',
				xAxisIndex: 0,
				yAxisIndex: 0,
				large: true,
				// largeThreshold: 100,
				// progressive: 100,
				dimensions: [
					{ name: 'open' },
					{ name: 'close' },
					{ name: 'open' },
					{ name: 'highest' }
				],
				// encode: {
				// 	x: 'date',
				// 	y: ['open', 'close', 'highest', 'lowest']
				// },
				encode: {
					x: 0,
					y: [1, 4, 3, 2],
				},
				itemStyle: {
					color: this.colors.success,
					color0: this.colors.danger,
					borderColor: this.colors.success,
					borderColor0: this.colors.danger,
				},
			}, {
				name: 'Volume',
				type: 'bar',
				xAxisIndex: 1,
				yAxisIndex: 1,
				large: true,
				// largeThreshold: 100,
				// progressive: 100,
				encode: {
					x: 0,
					y: 5,
				},
				itemStyle: {
					color: 'grey',
				},
			}],
		} as echarts.Options
		this.echart.setOption(bones)
	}

}



@Vts.Component({
	components: { 'v-symbol-echart': VSymbolEChart },
})
export default class VSymbolChart extends Mixins(VMixin) {
	$parent: Symbol
	vechart: VSymbolEChart

	created() {
		// this.getlives()
		this.gethistoricals()
	}

	mounted() {
		this.vechart = this.$refs['symbol_echart'] as any
		let el = this.$el.querySelector('#chart_div') as HTMLElement
	}

	busy = true
	symbol = this.$parent.symbol
	quote = this.$parent.all.quote
	lquotes = [] as Quotes.Live[]

	getlives() {
		this.busy = true
		return http.post('/quotes/lives', { symbols: [this.symbol] }).then((response: Quotes.Live[][]) => {
			// console.log(`response ->`, JSON.parse(JSON.stringify(response)))
			// this.lquotes = response[0]
			this.vechart.syncdataset(response[0])
			return this.$nextTick()
		}).catch(function(error) {
			console.error(`getlives Error ->`, error)
		}).finally(() => {
			this.busy = false
		})
	}

	gethistoricals() {
		return yahoo.getChart(this.symbol, {
			range: '1y', interval: '1h',
		}, this.hours.hours).then(response => {
			// console.log(`response ->`, JSON.parse(JSON.stringify(response)))
			this.vechart.syncdataset(response)
			return this.$nextTick()
		}).catch(function(error) {
			console.error(`gethistoricals Error ->`, error)
		}).finally(() => {
			this.busy = false
		})
	}

}


