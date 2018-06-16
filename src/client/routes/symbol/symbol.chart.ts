// 

import * as Vts from 'vue-property-decorator'
import { mixins as Mixins } from 'vue-class-component'
import Vue from 'vue'
import VMixin from '../../mixins/v.mixin'
import VEChartsMixin from '../../mixins/echarts.mixin'
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



@Vts.Component
class VSymbolEChart extends Mixins(VEChartsMixin) {

	$parent: VSymbolChart
	@Vts.Prop() quote: Quotes.Quote

	mounted() {
		this.$on('resize', this.onresize)
	}
	beforeDestroy() {

	}



	lquotes() { return this.option().dataset[0].source as Quotes.Live[] }

	@VMixin.NoCache get firstPrice() {
		let lquotes = this.lquotes()
		let lquote = lquotes[Math.floor(lquotes.length * (this.ctbounds().start / 100))]
		return lquote.open || lquote.price
	}
	@VMixin.NoCache get splitNumberY() {
		return Math.round(this.$el.offsetHeight / 100)
	}



	onresize() {
		console.log(`this.splitNumberY ->`, this.splitNumberY)
		this.echart.setOption({ yAxis: [{ splitNumber: this.splitNumberY }] })
	}



	setQuotes(lquotes: Quotes.Live[]) {
		console.log('syncQuotes ->', lquotes.length)

		let bones = {
			animation: false,
			color: [this.colors['grey-lighter']],
			// backgroundColor: this.colors.light,
			// color: ['#0a0a0a', '#ffb000', '#fed500', '#34bc6e', '#4dc0b5', '#009bef', '#5392ff', '#9753e1', '#e62325', '#ff509e', '#ffffff'],
			// color: Object.values(this.colors),
			textStyle: { color: this.colors.dark, fontSize: 14 },
			dataset: {
				// dimensions: ['timestamp', 'open', 'close', 'high', 'low'],
				source: lquotes,
			},
			toolbox: { itemSize: 0, feature: { dataZoom: { show: true, yAxisIndex: false } } },
			tooltip: {
				// showContent: !process.env.DEVELOPMENT,
				// alwaysShowContent: !!process.env.DEVELOPMENT,
				trigger: 'axis',
				triggerOn: 'mousemove',

				// position: [10, 10],
				position: (point, params, el, rect, size) => {
					return [point[0] - (size.contentSize[0] / 2), 2];
				},
				padding: [0, 0, 0, 0],
				confine: true, enterable: false,
				showDelay: 0, hideDelay: 1,
				transitionDuration: 0,
				// backgroundColor: 'transparent',
				// extraCssText: 'border: 1px solid #b8c1c1;',
				// formatter: params => {
				// 	// console.log('params ->', params)
				// 	let param = (params[0] || params) as echarts.EventParam<Quotes.Live>
				// 	let lquote = _.mapValues(param.value, n => pretty.number(n as any))
				// 	// console.log('lquote ->', lquote)
				// 	// Object.keys(lquote).forEach(k => lquote[k] = pretty.number(lquote[k]))


				// 	let html = ''
				// 	html += `<p>Open ${lquote.open}&nbsp;&nbsp;High ${lquote.high}&nbsp;&nbsp;Low ${lquote.low}&nbsp;&nbsp;Close ${lquote.close}</p>`
				// 	// html += `<p>OHLC: ${JSON.stringify(lquote)}</p>`
				// 	return `<div class="px-2 py-1 leading-none font-sans has-background-dark has-text-white rounded-sm">${html}</div>`
				// },
				axisPointer: {
					// link: { xAxisIndex: 'all' },
					animation: false, type: 'cross',
					shadowStyle: { opacity: 0 },
					lineStyle: { color: this.colors['grey-lighter'] },
					crossStyle: { color: this.colors['grey-light'] },
					label: {
						backgroundColor: this.colors.white, shadowBlur: 0,
						borderColor: this.colors.grey, borderWidth: 1, margin: 0,
						textStyle: {
							color: this.colors.dark, borderRadius: 0,
							fontSize: 14, padding: [4, 8], fontWeight: 'bold',
						},
						// formatter: params => pretty.number(params.value),
					},
				},
			},
			axisPointer: {
				link: { xAxisIndex: 'all' },
			},
			grid: [{
				top: 16,
				left: 64,
				right: 24,
				bottom: 92,
				show: true,
				backgroundColor: this.colors.white,
				borderColor: this.colors['grey-lightest'],
			}, {
				height: 64,
				left: 64,
				right: 24,
				bottom: 92,
			}],
			dataZoom: [{
				type: 'inside', throttle: 60,
				xAxisIndex: [0, 1],
				start: 0, end: 100,
				// rangeMode: ['value', 'percent'],
				zoomOnMouseWheel: 'shift',
				// moveOnMouseMove: false,
				// preventDefaultMouseMove: false,
			}, {
				type: 'slider', throttle: 60,
				xAxisIndex: [0, 1],
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
					margin: 4,
					textStyle: { color: this.colors.dark, fontSize: 14 },
					formatter: v => charts.xlabel(v),
				},
				// axisLine: { lineStyle: { color: this.colors.dark } },
				axisLine: { show: false },
				splitLine: { show: false },
				axisTick: { show: false },
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
				splitNumber: this.splitNumberY,
				splitArea: { show: false },
				axisLabel: {
					textStyle: { color: this.colors.dark, fontSize: 14 },
					formatter: value => pretty.number(value),
				},
				axisTick: { show: false },
				axisLine: { show: false },
				splitLine: { lineStyle: { color: this.colors['grey-lightest'] } },
				axisPointer: { label: { formatter: params => pretty.number(params.value) + '\n' + pretty.number(core.calc.percent(params.value, this.firstPrice), { percent: true, plusminus: true }) } },
			}, {
				scale: true,
				gridIndex: 1,
				axisLabel: { show: false },
				axisLine: { show: false },
				axisTick: { show: false },
				splitLine: { show: false },
				splitArea: { show: false },
				axisPointer: { show: false },
			}],
			series: [{
				name: 'OHLC',
				type: 'candlestick',
				xAxisIndex: 0,
				yAxisIndex: 0,
				large: true,
				largeThreshold: 200,
				// progressive: 500,
				// progressiveThreshold: 500,
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
				// progressive: 500,
				// progressiveThreshold: 500,
				animation: false,
				hoverAnimation: false,
				legendHoverLink: false,
				encode: { x: 'timestamp', y: 'size' },
				emphasis: null,
			}],
		} as echarts.Option
		this.echart.setOption(bones)
		// console.log(`this.echart.getOption() ->`, this.echart.getOption())
	}

}



@Vts.Component({
	components: { 'v-symbol-echart': VSymbolEChart },
})
export default class VSymbolChart extends Mixins(VMixin) {

	$parent: VSymbol
	@Vts.Prop() symbol: string
	@Vts.Prop() quote: Quotes.Quote

	vechart: VSymbolEChart
	mounted() {
		this.vechart = (this.$refs as any)['symbol_vechart']
		this.getQuotes()
	}

	beforeDestroy() {

	}

	brushing = false
	busy = true

	@Vts.Watch('quote.tickerId') w_tickerId(tickerId: number) {
		this.getQuotes()
	}
	getQuotes() {
		if (!Number.isFinite(this.quote.tickerId)) return;
		this.busy = true
		return Promise.resolve().then(() => {
			if (this.range == 'live') {
				return http.post('/quotes/lives', { symbols: [this.symbol] }).then(response => response[0])
			}
			return charts.getChart(this.quote, this.range)
		}).then((lquotes: Quotes.Live[]) => {
			this.$safety()
			this.vechart.setQuotes(lquotes)
		}).catch(error => {
			console.error(`getQuotes Error ->`, error)
		}).finally(() => {
			this.busy = false
		})
	}

	range = lockr.get('symbol.chart.range', yahoo.RANGES[1])
	ranges = ['live'].concat(yahoo.RANGES)
	get rangeindex() { return this.ranges.indexOf(this.range) }
	vrange(range: string) { return charts.range(range) }
	@Vts.Watch('range') w_range(range: string) {
		lockr.set('symbol.chart.range', range)
		this.getQuotes()
	}

	ohlc = lockr.get('symbol.chart.ohlc', true)
	@Vts.Watch('ohlc') w_ohlc(ohlc: boolean) {
		lockr.set('symbol.chart.ohlc', ohlc)
	}



}


