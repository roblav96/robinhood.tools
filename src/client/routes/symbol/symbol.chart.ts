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
import * as pretty from '../../adapters/pretty'
import * as charts from '../../adapters/charts'



@Vts.Component({
	template: `
		<div class="">
			<div class="absolute"></div>
		</div>
	`,
})
class VSymbolEChart extends Vue {
	$parent: VSymbolChart
	colors = this.$store.state.colors
	echart: charts.ECharts

	mounted() {
		console.log(`echarts ->`, echarts)
		this.echart = new charts.ECharts(this.$el.firstChild)
		console.log('this.echart ->', this.echart)
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

	empty() {
		this.echart.updateOption({
			// dataset: { source: [] },
			// series: [],
		})
	}



	// focused = false
	ontap = _.throttle(this.tapped, 300, { leading: false, trailing: true })
	tapped(event: HammerEvent) {
		console.log(`tapped event ->`, JSON.parse(JSON.stringify(event)))

		// console.log(`TAP tapCount ->`, event.tapCount)
		// let contains = this.echart.containPixel({ gridIndex: [0] }, [event.srcEvent.offsetX, event.srcEvent.offsetY])
		// if (!contains) return;
		// this.focused = !this.focused
		// this.echart.setOption({
		// 	grid: [{
		// 		borderWidth: this.focused ? 2 : 1,
		// 		borderColor: this.focused ? this.colors.secondary : this.colors['grey-lightest'],
		// 	}],
		// 	dataZoom: [{ zoomOnMouseWheel: this.focused }],
		// })
	}



	onresize = _.debounce(this.resize, 300, { leading: false, trailing: true })
	resize() {
		this.echart.resize({ width: this.$el.offsetWidth, height: this.$el.offsetHeight })
	}



	syncQuotes(lquotes: Quotes.Live[]) {
		// lquotes = lquotes.map(v => _.mapValues(v, n => core.math.round(n as any, 4))) as any
		console.log('syncQuotes ->', lquotes.length)
		let root = charts.bones.root()

		let bones = {
			animation: false,
			color: [this.colors['grey-lighter']],
			// backgroundColor: this.colors.light,
			// color: ['#0a0a0a', '#ffb000', '#fed500', '#34bc6e', '#4dc0b5', '#009bef', '#5392ff', '#9753e1', '#e62325', '#ff509e', '#ffffff'],
			// color: Object.values(this.colors),
			textStyle: { color: this.colors.dark, fontSize: 14 },
			dataset: {
				// dimensions: ['timestamp',''],
				source: lquotes,
				// source: data,
			},
			tooltip: {
				// showContent: !process.env.DEVELOPMENT,
				// alwaysShowContent: !!process.env.DEVELOPMENT,
				trigger: 'axis',
				// position: [10, 10],
				// position: function(point, params, el, rect, size) {
				// 	console.log('size ->', size)
				// 	console.log('rect ->', rect)
				// 	console.log('el ->', el)
				// 	console.log('params ->', params)
				// 	console.log('point ->', point)
				// 	return [point[0], 0];
				// },
				padding: [0, 0, 0, 0],
				confine: true, enterable: false,
				showDelay: 0, hideDelay: 1,
				transitionDuration: 0,
				// backgroundColor: 'transparent',
				// extraCssText: 'border: 1px solid #b8c1c1;',
				// formatter: params => {
				// 	console.log('params ->', params)
				// 	let param = (params[0] || params) as echarts.EventParam<Quotes.Live>
				// 	let lquote = _.mapValues(param.value, n => pretty.number(n as any))
				// 	// console.log('lquote ->', lquote)
				// 	// Object.keys(lquote).forEach(k => lquote[k] = pretty.number(lquote[k]))


				// 	let html = ''
				// 	html += `<p>OHLC: ${lquote.open} ${lquote.high} ${lquote.low} ${lquote.close}</p>`
				// 	// html += `<p>OHLC: ${JSON.stringify(lquote)}</p>`

				// 	return `<div class="px-2 py-1 font-sans has-background-dark has-text-white rounded-sm">${html}</div>`
				// },
				axisPointer: {
					link: [{ xAxisIndex: 'all' }],
					animation: false, type: 'cross',
					lineStyle: { color: this.colors['grey-lighter'] },
					crossStyle: { color: this.colors['grey-light'] },
					label: {
						backgroundColor: this.colors.white, shadowBlur: 0,
						borderColor: this.colors.dark, borderWidth: 1, margin: 0,
						textStyle: {
							color: this.colors.dark, borderRadius: 0,
							fontSize: 14, padding: [6, 8],
						},
						formatter: params => pretty.number(params.value),
					},
				},
			},
			grid: [{
				top: 24,
				left: 64,
				right: 64,
				bottom: 92,
				show: true,
				backgroundColor: this.colors.white,
				borderColor: this.colors['grey-lightest'],
			}, {
				height: 64,
				left: 64,
				right: 64,
				bottom: 92,
			}],
			dataZoom: [{
				type: 'inside',
				xAxisIndex: [0, 1],
				// rangeMode: ['value', 'percent'],
				zoomOnMouseWheel: 'shift',
				// preventDefaultMouseMove: false,
			}, {
				show: true,
				xAxisIndex: [0, 1],
				type: 'slider',
				height: 32,
				bottom: 24,
				showDetail: false,
				backgroundColor: this.colors.white,
				dataBackground: {
					areaStyle: { color: this.colors['white-ter'], opacity: 1 },
					lineStyle: { color: this.colors['grey-light'], opacity: 1 },
				},
				borderColor: this.colors['grey-lightest'],
				fillerColor: 'rgba(184,194,204,0.33)',
				// textStyle: { color: this.colors.dark },
				handleStyle: { color: this.colors['grey-lighter'] },
				// handleIcon: 'M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
			}],
			xAxis: [{
				type: 'category',
				boundaryGap: true,
				axisLabel: {
					textStyle: { color: this.colors.dark, fontSize: 14 },
					formatter: v => charts.xlabel(v),
				},
				axisLine: { lineStyle: { color: this.colors.dark } },
				splitLine: { show: false },
				axisPointer: {
					label: {
						margin: 1,
						formatter: params => charts.xlabel(params.value),
					},
				},
			}, {
				type: 'category',
				boundaryGap: true,
				gridIndex: 1,
				axisLabel: { show: false },
				axisLine: { show: false },
				axisTick: { show: false },
				splitLine: { show: false },
				splitArea: { show: false },
				axisPointer: { show: false },
				// axisPointer: { label: { show: false } },
			}],
			yAxis: [{
				scale: true,
				splitArea: { show: false },
				axisLabel: {
					textStyle: { color: this.colors.dark, fontSize: 14 },
					formatter: value => { return pretty.number(value) },
				},
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
			series: [{
				name: 'OHLC',
				type: 'candlestick',
				xAxisIndex: 0,
				yAxisIndex: 0,
				large: true,
				largeThreshold: 200,
				animation: false,
				hoverAnimation: false,
				legendHoverLink: false,
				// dimensions: ['timestamp', 'open', 'close', 'high', 'low'],
				encode: {
					x: 'timestamp',
					y: ['open', 'close', 'high', 'low'],
				},
				itemStyle: {
					borderColor: null, borderColor0: null,
					color: this.colors.success, color0: this.colors.danger,
				},
				emphasis: null,
			}, {
				name: 'Size',
				type: 'bar',
				xAxisIndex: 1,
				yAxisIndex: 1,
				large: true,
				largeThreshold: 200,
				animation: false,
				hoverAnimation: false,
				legendHoverLink: false,
				encode: { x: 'timestamp', y: 'size' },
				emphasis: null,
			}],
		} as echarts.Option
		this.echart.setOption(bones)
		// console.log(`this.echart.getOption() ->`, this.echart.getOption())
		this.$nextTick(() => this.echart.resetZoom())
	}

}



@Vts.Component({
	components: { 'v-symbol-echart': VSymbolEChart },
})
export default class VSymbolChart extends Mixins(VMixin) {
	$parent: VSymbol
	@Vts.Prop() symbol: string
	@Vts.Prop() quote: Quotes.Quote

	created() {

	}

	vechart: VSymbolEChart
	mounted() {
		this.vechart = (this.$refs as any)['symbol_echart']
		this.getQuotes()
	}

	busy = true
	@Vts.Watch('quote.tickerId') w_tickerId(tickerId: number) {
		this.getQuotes()
	}

	range = lockr.get('symbol.chart.range', yahoo.RANGES[1])
	ranges = ['live'].concat(yahoo.RANGES)
	get rangeindex() { return this.ranges.indexOf(this.range) }
	vrange(range: string) { return charts.range(range) }
	@Vts.Watch('range') w_range(range: string) {
		lockr.set('symbol.chart.range', range)
		this.getQuotes()
	}

	getQuotes() {
		this.vechart.empty()
		if (!Number.isFinite(this.quote.tickerId)) return;

		this.busy = true
		return Promise.resolve().then(() => {
			if (this.range == 'live') {
				return http.post('/quotes/lives', { symbols: [this.symbol] }).then(response => response[0])
			}
			return charts.getChart(this.symbol, this.quote.tickerId, this.range)

		}).then((lquotes: Quotes.Live[]) => {
			this.$safety()
			this.vechart.syncQuotes(lquotes)
		}).catch(error => {
			console.error(`getQuotes Error ->`, error)
		}).finally(() => {
			this.busy = false
		})
	}



}


