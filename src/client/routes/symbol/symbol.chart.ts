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
		if (contains) this.resetZoom();
	}

	dims() { return { width: this.$el.offsetWidth, height: this.$el.offsetHeight } as echarts.Dims }
	onresize = _.debounce(this.resize, 100)
	resize() {
		this.echart.resize(this.dims())
	}

	resetZoom() {
		this.echart.dispatchAction({ type: 'dataZoom', start: 0, end: 100 })
	}

	onquotes(lquotes: Quotes.Live[]) {
		console.log('onquotes ->', lquotes.length)
		let bones = {
			animation: false,
			color: [this.colors['grey-lighter']],
			// color: ['#0a0a0a', '#ffb000', '#fed500', '#34bc6e', '#4dc0b5', '#009bef', '#5392ff', '#9753e1', '#e62325', '#ff509e', '#ffffff'],
			// color: Object.values(this.colors),
			textStyle: { color: this.colors.dark, fontSize: 14, lineHeight: 1 },
			dataset: {
				// dimensions: ['timestamp',''],
				source: lquotes,
				// source: data,
			},
			tooltip: {
				// alwaysShowContent: !!process.env.DEVELOPMENT,
				showContent: false,
				trigger: 'axis',
				axisPointer: { type: 'cross' },
				transitionDuration: 0.1,
				showDelay: 0,
				hideDelay: 1,
				padding: [4, 8],
				backgroundColor: this.colors.dark,
				extraCssText: 'margin: 1rem 2rem;',
				// formatter: '{a}: {b}: {c}: {d}',
				// textStyle: { color: this.colors.white, lineHeight: 1, fontSize: 14 },
			},
			axisPointer: [{
				animation: false,
				link: [{ xAxisIndex: 'all' }],
				lineStyle: { color: this.colors['grey-lighter'] },
				crossStyle: { color: this.colors['grey-light'] },
				label: {
					textStyle: { color: this.colors.white, lineHeight: 1, fontSize: 14 },
					backgroundColor: this.colors.dark,
					formatter: params => utils.format.number(params.value),
				},
				// }, {
				// 	animation: false,
				// 	link: [{ xAxisIndex: 'all' }],
				// 	lineStyle: { color: this.colors['grey-lighter'] },
				// 	crossStyle: { color: this.colors['grey-light'] },
				// 	label: {
				// 		formatter: params => charts.format.xlabel(params.value),
				// 	},
			}],
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
				rangeMode: ['value', 'percent'],
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
				boundaryGap: false,
				axisLabel: {
					textStyle: { color: this.colors.dark, lineHeight: 1, fontSize: 14 },
					formatter: v => charts.format.xlabel(v),
				},
				axisLine: { lineStyle: { color: this.colors.dark } },
				splitLine: { show: false },
				axisPointer: {
					label: {
						textStyle: { color: this.colors.white, lineHeight: 1, fontSize: 14 },
						formatter: params => charts.format.xlabel(params.value),
					},
				},
			}, {
				type: 'category',
				boundaryGap: false,
				gridIndex: 1,
				axisLabel: { show: false },
				axisLine: { show: false },
				axisTick: { show: false },
				splitLine: { show: false },
				splitArea: { show: false },
				axisPointer: { label: { show: false }, },
			}],
			yAxis: [{
				scale: true,
				splitArea: { show: false },
				axisLabel: {
					textStyle: { color: this.colors.dark, lineHeight: 1, fontSize: 14 },
					formatter: value => { return utils.format.number(value) },
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
					color: this.colors.success,
					color0: this.colors.danger,
					borderColor: null,
					borderColor0: null,
				},
				emphasis: null,
				tooltip: {
					formatter: '{a}: {b}: {c}: {d}',
				},
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
				itemStyle: {
					// color: this.colors.success,
					// borderColor: this.colors['grey-light'],
					// borderWidth: 0.5,
				},
				emphasis: null,
			}],
		} as echarts.Options
		this.echart.setOption(bones)
		console.log(`this.echart.getOption() ->`, this.echart.getOption())
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
		this.resync()
	}

	busy = true
	@Vts.Watch('quote.tickerId') w_tickerId(tickerId: number) {
		this.resync()
	}

	range = lockr.get('symbol.chart.range', charts.RANGES[1])
	ranges = ['live'].concat(charts.RANGES)
	get rangeindex() { return this.ranges.indexOf(this.range) }
	vrange(range: string) { return charts.format.range(range) }
	@Vts.Watch('range') w_range(range: string) {
		lockr.set('symbol.chart.range', range)
		this.resync()
	}

	resync() {
		if (!Number.isFinite(this.quote.tickerId)) return;
		this.busy = true
		return Promise.resolve().then(() => {
			return this.range == 'live' ? this.getLives() : this.getHistoricals()
		}).then(lquotes => {
			this.$safety()
			this.vechart.onquotes(lquotes)
			return this.$nextTick().then(() => this.vechart.resetZoom())
		}).catch(error => {
			console.error(`resync Error ->`, error)
		}).finally(() => {
			this.busy = false
		})
	}

	getLives() {
		return http.post('/quotes/lives', { symbols: [this.symbol] }).then((response: Quotes.Live[][]) => {
			return response[0]
			// console.log(`response ->`, JSON.parse(JSON.stringify(response)))
			// this.vechart.syncdataset(response[0])
			// return this.$nextTick()
		})
	}

	getHistoricals() {
		return charts.getChart(this.symbol, this.quote.tickerId, this.range)
		// return yahoo.getChart(this.symbol, { range: this.range }, this.hours.hours)
		// .then(response => {
		// 	return response
		// console.log(`response ->`, JSON.parse(JSON.stringify(response)))
		// this.vechart.syncdataset(response)
		// return this.$nextTick()
		// })
	}

}


