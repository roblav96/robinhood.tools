// 

import * as Vts from 'vue-property-decorator'
import { mixins as Mixins } from 'vue-class-component'
import Vue from 'vue'
import VMixin from '../../mixins/v.mixin'
import VSymbol from './symbol'
import * as echarts from 'echarts'
import * as ecstat from 'echarts-stat'
import * as lockr from 'lockr'
import * as _ from '../../../common/lodash'
import * as core from '../../../common/core'
import * as rkeys from '../../../common/rkeys'
import * as quotes from '../../../common/quotes'
import * as yahoo from '../../../common/yahoo'
import * as http from '../../../common/http'
import * as utils from '../../adapters/utils'
import * as charts from '../../adapters/charts'



@Vts.Component({
	template: `
		<div>
			<div
				v-show="ready"
				class="absolute"
				v-on:dblclick="ondblclick"
				v-on:mousewheel="onmousewheel"
			></div>
		</div>
	`,
})
class VSymbolEChart extends Vue {

	$parent: VSymbolChart
	echart: echarts.ECharts
	colors = this.$store.state.colors
	quote = this.$parent.quote
	ready = false

	mounted() {
		this.echart = echarts.init(this.$el.firstChild as HTMLElement)
		utils.wemitter.on('resize', this.onresize, this)
		if (process.env.DEVELOPMENT) module.hot.addStatusHandler(this.onresize);
		this.resize()
	}

	beforeDestroy() {
		if (process.env.DEVELOPMENT) module.hot.removeStatusHandler(this.onresize);
		utils.wemitter.off('resize', this.onresize, this)
		this.onresize.cancel()
		this.echart.clear()
		this.echart.dispose()
		this.echart = null
	}

	onevent(param: echarts.EventParam) {
		console.log(`param ->`, param)
	}

	onmousewheel(event: MouseEvent) {
		console.log(`event ->`, event)
	}

	ondblclick(event: MouseEvent) {
		let contains = this.echart.containPixel({ gridIndex: [0, 1] }, [event.offsetX, event.offsetY])
		if (contains) this.resetzoom();
	}

	dims() { return { width: this.$el.offsetWidth, height: this.$el.offsetHeight } as echarts.Dims }
	onresize = _.debounce(this.resize, 100)
	resize() {
		this.echart.resize(this.dims())
	}

	resetzoom() {
		this.echart.dispatchAction({ type: 'dataZoom', start: 0, end: 100 })
	}

	syncdataset(lquotes: Quotes.Live[]) {
		console.log('lquotes ->', lquotes.length)
		let bones = {
			animation: false,
			// backgroundColor: this.colors['grey-lightest'],
			// color: Object.values(this.colors),
			dataset: {
				// dimensions: ['timestamp',''],
				source: lquotes,
				// source: data,
			},
			tooltip: {
				trigger: 'axis',
				axisPointer: {
					type: 'line',
				},
			},
			// visualMap: {
			// 	show: false,
			// 	seriesIndex: 1,
			// 	// dimension: 1,
			// 	pieces: [{
			// 		value: 1,
			// 		color: this.colors.danger,
			// 	}, {
			// 		value: 0,
			// 		color: this.colors.warning,
			// 	}, {
			// 		value: -1,
			// 		color: this.colors.success,
			// 	}]
			// },
			grid: [{
				top: 24,
				left: 56,
				right: 56,
				bottom: 92,
				show: true,
				backgroundColor: this.colors.white,
				borderColor: this.colors['grey-lightest'],
			}, {
				height: 64,
				left: 56,
				right: 56,
				bottom: 92,
			}],
			xAxis: [{
				type: 'category',
				scale: true,
				boundaryGap: false,
				axisLabel: {
					textStyle: { color: this.colors.dark },
					formatter: v => charts.xformat(v),
					// formatter: v => utils.format.time(v, {}),
				},
				axisLine: { lineStyle: { color: this.colors.dark } },
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
				axisLabel: { textStyle: { color: this.colors.dark } },
				axisLine: { lineStyle: { color: this.colors.dark } },
				splitLine: { lineStyle: { color: this.colors['grey-lightest'] } },
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
				// preventDefaultMouseMove: false,
			}, {
				show: true,
				xAxisIndex: [0, 1],
				type: 'slider',
				height: 32,
				bottom: 24,
				backgroundColor: this.colors.white,
				dataBackground: {
					areaStyle: { color: this.colors['white-ter'], opacity: 1 },
					lineStyle: { color: this.colors['grey-light'], opacity: 1 },
				},
				borderColor: this.colors['grey-lightest'],
				fillerColor: 'rgba(184,194,204,0.33)',
				textStyle: { color: this.colors.dark },
				handleStyle: { color: this.colors['grey-lighter'] },
				// handleIcon: 'M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
			}],
			series: [{
				name: 'OHLC',
				type: 'candlestick',
				xAxisIndex: 0,
				yAxisIndex: 0,
				large: true,
				largeThreshold: 200,
				// dimensions: ['timestamp', 'open', 'close', 'high', 'low'],
				encode: {
					x: 'timestamp',
					y: ['open', 'close', 'high', 'low']
				},
				// encode: {
				// 	x: 0,
				// 	y: [1, 4, 3, 2],
				// },
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
				largeThreshold: 200,
				encode: { x: 'timestamp', y: 'size' },
				itemStyle: { color: this.colors['grey-lightest'] },
			}],
		} as echarts.Options
		this.echart.setOption(bones)
		// console.log(`this.echart.getOption() ->`, this.echart.getOption().series[1])
		if (!this.ready) this.$nextTick(() => this.ready = true);
	}

}



@Vts.Component({
	components: { 'v-symbol-echart': VSymbolEChart },
})
export default class VSymbolChart extends Mixins(VMixin) {
	$parent: VSymbol

	created() {

	}

	vechart: VSymbolEChart
	mounted() {
		this.vechart = (this.$refs as any)['symbol_echart']
		this.resync()
	}

	busy = true
	symbol = this.$parent.symbol
	quote = this.$parent.all.quote

	range = lockr.get('symbol.chart.range', '5d')
	ranges = yahoo.RANGES
	vrange(range: string) { return utils.format.range(range) }

	@Vts.Watch('range') w_range(range: string) {
		lockr.set('symbol.chart.range', range)
		this.resync()
	}
	@Vts.Watch('$parent.symbol') w_symbol(symbol: string) {
		this.symbol = symbol
		this.resync()
	}

	resync() {
		this.busy = true
		return Promise.resolve().then(() => {
			return this.gethistoricals()
			// return this.getlives()
		}).then(lquotes => {
			this.$safety()
			this.vechart.syncdataset(lquotes)
			return this.$nextTick()
		}).catch(error => {
			console.error(`resync Error -> %O`, error)
		}).finally(() => {
			this.vechart.resetzoom()
			this.busy = false
		})
	}

	getlives() {
		return http.post('/quotes/lives', { symbols: [this.symbol] }).then((response: Quotes.Live[][]) => {
			return response[0]
			// console.log(`response ->`, JSON.parse(JSON.stringify(response)))
			// this.vechart.syncdataset(response[0])
			// return this.$nextTick()
		})
	}

	gethistoricals() {
		return yahoo.getChart(this.symbol, { range: this.range }, this.hours.hours)
		// .then(response => {
		// 	return response
		// console.log(`response ->`, JSON.parse(JSON.stringify(response)))
		// this.vechart.syncdataset(response)
		// return this.$nextTick()
		// })
	}

}


