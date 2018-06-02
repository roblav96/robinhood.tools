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
import * as quotes from '@/common/quotes'
import * as yahoo from '@/common/yahoo'
import * as http from '@/client/adapters/http'
import * as utils from '@/client/adapters/utils'



@Vts.Component({
	template: `<div class="flex-col-full w-full h-full"></div>`,
})
class VSymbolEChart extends Vue {
	$parent: VSymbolChart
	symbol = this.$parent.symbol

	echart: echarts.ECharts

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
	onresize = _.debounce(this.resize, 300, { leading: false, trailing: true })
	resize() {
		let navbar = document.getElementById('navbar')
		let header = document.getElementById('symbol_route').firstChild as HTMLElement
		let screen = utils.screen()
		let dims = this.dims()
		dims.height = screen.height - navbar.offsetHeight - header.offsetHeight
		this.echart.resize(dims)
	}

	syncdataset(lquotes: Quotes.Live[]) {
		let dates = lquotes.map(v => new Date(v.timestamp))
		let data = lquotes.map(v => [v.open, v.high, v.low, v.close])
		let bones = {
			animation: false,
			dataset: {
				source: lquotes.map(v => {
					return [v.timestamp, v.open, v.high, v.low, v.close, v.size]
				}),
			},
			grid: [{
				left: '5%',
				right: '5%',
				bottom: 200,
			}, {
				left: '5%',
				right: '5%',
				height: 80,
				bottom: 80,
			}],
			xAxis: [{
				type: 'category',
				scale: true,
				boundaryGap: false,
				axisLine: { onZero: false },
				splitLine: { show: false },
				splitNumber: 20,
				min: 'dataMin',
				max: 'dataMax',
			}, {
				type: 'category',
				gridIndex: 1,
				scale: true,
				boundaryGap: false,
				axisLine: { onZero: false },
				axisTick: { show: false },
				splitLine: { show: false },
				axisLabel: { show: false },
				splitNumber: 20,
				min: 'dataMin',
				max: 'dataMax',
			}],
			yAxis: [{
				scale: true,
				splitArea: { show: true },
			}, {
				scale: true,
				gridIndex: 1,
				splitNumber: 2,
				axisLabel: { show: false },
				axisLine: { show: false },
				axisTick: { show: false },
				splitLine: { show: false },
			}],
			dataZoom: [{
				type: 'inside',
				xAxisIndex: [0, 1],
				start: 10,
				end: 100,
			}, {
				show: true,
				xAxisIndex: [0, 1],
				type: 'slider',
				bottom: 10,
				start: 10,
				end: 100,
				handleIcon: 'M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
				handleSize: '105%',
			}],
			visualMap: [{
				show: false,
				seriesIndex: 1,
				dimension: 6,
				pieces: [{ value: 1 }, { value: -1 }],
			}],
			series: [{
				type: 'candlestick',
				encode: {
					x: 0,
					y: [1, 4, 3, 2],
				},
			}, {
				name: 'Volume',
				type: 'bar',
				xAxisIndex: 1,
				yAxisIndex: 1,
				// itemStyle: { color: '#7fbe9e' },
				large: true,
				encode: { x: 0, y: 5 },
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
		console.time(`gethistoricals`)
		let url = yahoo.chartRequest(this.symbol, { range: '1mo', interval: '1h' }, this.hours.hours)
		return http.get(url, { proxify: true }).then(yahoo.chartResponse).then(response => {
			// console.log(`response ->`, JSON.parse(JSON.stringify(response)))
			console.timeEnd(`gethistoricals`)
		}).catch(function(error) {
			console.error(`gethistoricals Error ->`, error)
		})
	}

}


