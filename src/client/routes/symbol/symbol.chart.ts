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
import * as alerts from '../../adapters/alerts'
import socket from '../../adapters/socket'



@Vts.Component
class VSymbolEChart extends Mixins(VEChartsMixin) {

	@Vts.Prop() quote: Quotes.Quote
	@Vts.Prop() range: string
	@Vts.Prop() axis: 'category' | 'time'
	colors = this.$store.state.colors

	mounted() {

	}
	beforeDestroy() {

	}



	lquotes() { return _.get(this.getOption(), 'dataset[0].source', []) as Quotes.Live[] }

	@VMixin.NoCache get ctprice() {
		let lquotes = this.lquotes()
		let ctbounds = this.ctbounds()
		let lquote = lquotes[core.math.clamp(Math.floor(lquotes.length * (ctbounds.start / 100)), 0, lquotes.length - 1)]
		if (this.axis == 'category') lquote = lquotes[ctbounds.startValue];
		if (this.axis == 'time') lquote = lquotes.find(v => v.timestamp >= ctbounds.startValue);
		return lquote.open || lquote.price
	}



	@Vts.Watch('axis') w_axis(axis: string) {
		let lquotes = this.lquotes()
		this.echart.clear()
		this.build(lquotes)
	}



	build(lquotes = this.lquotes()) {
		console.log(`this.$el.offsetWidth ->`, this.$el.offsetWidth)
		let stamp = Date.now()
		let bones = {
			animation: false,
			color: [this.colors['grey-lighter']],
			// color: ['#0a0a0a', '#ffb000', '#fed500', '#34bc6e', '#4dc0b5', '#009bef', '#5392ff', '#9753e1', '#e62325', '#ff509e', '#ffffff'],
			// color: Object.values(this.colors),
			textStyle: { color: this.colors.dark, fontSize: 14 },
			dataset: [{
				source: lquotes,
			}],
			toolbox: { itemSize: 0, feature: { dataZoom: { show: true, yAxisIndex: false } } },
			tooltip: [{
				// showContent: !process.env.DEVELOPMENT,
				// alwaysShowContent: !!process.env.DEVELOPMENT,
				trigger: 'axis',
				triggerOn: 'mousemove',
				// position: [10, 10],
				// position: (point, params, el, rect, size) => {
				// 	return [point[0] - (size.contentSize[0] / 2), 0];
				// },
				confine: true,
				enterable: false,
				showDelay: 0,
				hideDelay: 0,
				transitionDuration: 0,
				// padding: 0,
				padding: [0, 0, 0, 64],
				backgroundColor: 'transparent',
				// formatter: '{a}: {b1}<br>{c}: {d0}',
				// extraCssText: `border: 0.125rem solid ${this.colors['grey-darker']};`,
				formatter: (params: echarts.EventParam<Quotes.Live>[]) => {
					// console.log('params ->', params)
					let option = this.getOption()
					let html = ''
					params.forEach((param, i) => {
						// console.log(`param.value ->`, param.value)
						let trs = `<tr><td class="font-semibold pr-2"><i class="mdi mdi-circle" style="color: ${param.color};"></i> ${param.seriesName}</td>`
						let tooltip = option.series[param.seriesIndex].encode.tooltip
						if (Array.isArray(tooltip)) {
							trs += `</tr>`
							tooltip.forEach((key: string) => {
								let value = pretty.number(param.value[key], { nozeros: true })
								trs += `<tr><td class="pr-2">${_.startCase(key)}</td><td class="text-right">${value}</td></tr>`
							})
						} else {
							let value = pretty.number(param.value[tooltip], { compact: true, precision: 1, nozeros: true })
							trs += `<td class="text-right">${value}</td></tr>`
						}
						let hr = i < params.length - 1 ? `<hr class="my-1 has-background-grey-darker">` : ''
						html += `<table class="m-0 w-full"><tbody>${trs}</tbody></table>${hr}`
					})
					return `<div class="font-sans leading-tight has-background-dark has-text-white p-2 rounded">${html}</div>`
				},
				axisPointer: {
					type: 'cross',
					animation: false,
					shadowStyle: { opacity: 0 },
					lineStyle: { color: this.colors['grey-lighter'] },
					crossStyle: { color: this.colors['grey-lighter'] },
					label: {
						backgroundColor: this.colors.white, shadowBlur: 0, margin: 1,
						borderColor: this.colors['grey-lighter'], borderWidth: 1,
						textStyle: {
							color: this.colors.dark, borderRadius: 0,
							fontSize: 14, padding: [4, 8], fontWeight: 'bold',
						},
						// formatter: params => pretty.number(params.value),
					},
				},
			}],
			axisPointer: [{
				link: [{ xAxisIndex: 'all' }],
			}],
			grid: [{
				top: 8,
				left: 64,
				right: 64,
				bottom: 92,
				show: true,
				backgroundColor: this.colors.white,
				borderWidth: 0,
				// borderColor: this.colors['grey-lighter'],
			}, {
				height: 64,
				left: 64,
				right: 64,
				bottom: 92,
			}],
			dataZoom: [{
				type: 'inside',
				throttle: 0,
				xAxisIndex: [0, 1],
				// start: 0,
				start: this.range == 'live' ? core.math.clamp(core.calc.slider(lquotes.length - 100, 0, lquotes.length), 0, 100) : 0,
				end: 100,
				// rangeMode: ['value', 'percent'],
				zoomOnMouseWheel: 'shift',
				// moveOnMouseMove: false,
				preventDefaultMouseMove: true,
			}, {
				type: 'slider',
				throttle: 0,
				xAxisIndex: [0, 1],
				left: 64,
				right: 64,
				height: 32,
				bottom: 24,
				showDetail: false,
				backgroundColor: this.colors.white,
				dataBackground: {
					areaStyle: { color: this.colors['white-bis'], opacity: 1 },
					lineStyle: { color: this.colors['grey-light'], opacity: 1 },
				},
				borderColor: this.colors['grey-lighter'],
				fillerColor: 'rgba(184,194,204,0.2)',
				// textStyle: { color: this.colors.dark },
				handleStyle: { color: this.colors['grey-lighter'] },
				// handleIcon: 'M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
			}],
			xAxis: [{
				type: this.axis,
				boundaryGap: true,
				axisLabel: {
					margin: 5,
					textStyle: { color: this.colors.dark, fontSize: 14 },
					formatter: v => charts.xlabel(v),
				},
				// axisLine: { lineStyle: { color: this.colors.dark } },
				axisLine: { show: false },
				splitLine: { show: false },
				axisTick: { show: false },
				axisPointer: {
					label: {
						formatter: params => charts.xlabel(params.value),
					},
				},
			}, {
				type: this.axis,
				boundaryGap: true,
				gridIndex: 1,
				axisLabel: { show: false },
				axisLine: { show: false },
				axisTick: { show: false },
				splitLine: { show: false },
				splitArea: { show: false },
				axisPointer: { type: 'none', label: { show: false } },
			}],
			yAxis: [{
				scale: true,
				axisLabel: {
					textStyle: { color: this.colors.dark, fontSize: 14 },
					formatter: value => pretty.number(value),
				},
				axisTick: { show: false },
				axisLine: { show: false },
				splitArea: { show: false },
				splitLine: { lineStyle: { color: this.colors['grey-lightest'] } },
				axisPointer: {
					label: { formatter: params => pretty.number(params.value) + '\n' + pretty.number(core.calc.percent(params.value, this.ctprice), { percent: true, plusminus: true }) }
				},
			}, {
				scale: true,
				gridIndex: 1,
				splitNumber: 2,
				// axisLabel: {
				// 	inside: true,
				// 	textStyle: { color: this.colors.dark, fontSize: 10 },
				// 	formatter: value => pretty.number(value, { nozeros: true }),
				// },
				axisLabel: { show: false },
				axisLine: { show: false },
				axisTick: { show: false },
				splitArea: { show: false },
				splitLine: { show: false },
				axisPointer: { label: { show: false } },
			}],
			series: [{
				name: 'OHLC',
				type: 'candlestick',
				xAxisIndex: 0,
				yAxisIndex: 0,
				large: true,
				largeThreshold: 128,
				progressive: 512,
				progressiveThreshold: 512,
				animation: false,
				hoverAnimation: false,
				legendHoverLink: false,
				// dimensions: ['timestamp', 'open', 'close', 'high', 'low'],
				encode: {
					x: 'timestamp',
					y: ['open', 'close', 'high', 'low'],
					tooltip: ['open', 'high', 'low', 'close'],
				},
				itemStyle: {
					borderColor: this.colors.success, borderColor0: this.colors.danger, borderWidth: 1,
					color: this.colors.success, color0: this.colors.danger,
				},
				emphasis: null,
				// markLine: { data: [{ name: 'Price', yAxis: this.quote.price }] },
			}, {
				name: 'Size',
				type: 'bar',
				xAxisIndex: 1,
				yAxisIndex: 1,
				large: true,
				largeThreshold: 128,
				progressive: 512,
				progressiveThreshold: 512,
				animation: false,
				hoverAnimation: false,
				legendHoverLink: false,
				encode: {
					x: 'timestamp',
					y: 'size',
					tooltip: 'size',
				},
				emphasis: null,
			}],
		} as echarts.Option
		console.log(`build bones ->`, JSON.parse(JSON.stringify(bones)))
		this.echart.setOption(bones)
		_.defer(() => console.log(`echart build ->`, Date.now() - stamp + 'ms'))
	}

	onlquote(lquote: Quotes.Live) {
		let lquotes = this.lquotes()
		let last = lquotes[lquotes.length - 1]
		if (last.liveCount == lquote.liveCount) {
			core.object.merge(last, lquote)
		} else lquotes.push(lquote);
		this.echart.setOption({ dataset: [{ source: lquotes }] })
		this.reshowtip()
	}



}



@Vts.Component({
	components: { 'v-symbol-echart': VSymbolEChart },
})
export default class VSymbolChart extends Mixins(VMixin) {

	@Vts.Prop() quote: Quotes.Quote
	@VMixin.NoCache get vechart() { return (this.$refs as any)['symbol_vechart'] as VSymbolEChart }

	mounted() {
		this.getQuotes()
	}
	beforeDestroy() {
		socket.offListener(this.vechart.onlquote)
	}

	busy = true
	isbrushing = false

	@Vts.Watch('quote.tickerId') w_tickerId(tickerId: number) {
		this.getQuotes()
	}
	getQuotes() {
		if (!Number.isFinite(this.quote.tickerId)) return;
		this.busy = true
		return Promise.resolve().then(() => {
			if (this.range == 'live') {
				return http.post('/quotes/lives', { symbols: [this.quote.symbol] }).then(response => response[0])
			}
			return charts.getChart(this.quote, this.range)
		}).then((lquotes: Quotes.Live[]) => {
			this.$safety()
			if (lquotes.length == 0) {
				alerts.toast(`Data for range '${core.string.capitalize(this.range)}' not found!`)
				this.vechart.echart.clear()
				return
			}
			this.vechart.build(lquotes)
			socket.offListener(this.vechart.onlquote)
			if (this.range == 'live' && lquotes.length > 0) {
				socket.on(`${rkeys.LIVES}:${this.quote.symbol}`, this.vechart.onlquote)
			}
		}).catch(error => {
			console.error(`getQuotes Error ->`, error)
		}).finally(() => {
			this.busy = false
		})
	}

	@Vts.Watch('quote', { deep: true }) w_quote(quote: Quotes.Quote) {
		if (!this.vechart.rendered || this.range != 'live' || quote.size == 0) return;
		let lquote = quotes.getConverted(quote, quotes.ALL_LIVE_KEYS) as Quotes.Live
		// console.log(`ON QUOTE ->`, JSON.parse(JSON.stringify(lquote)))
		lquote.liveCount++
		this.vechart.onlquote(lquote)
	}



	range = lockr.get('symbol.chart.range', yahoo.RANGES[2])
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

	axis = lockr.get('symbol.chart.axis', 'category') as 'category' | 'time'
	@Vts.Watch('axis') w_axis(axis: string) {
		lockr.set('symbol.chart.axis', axis)
	}



}


