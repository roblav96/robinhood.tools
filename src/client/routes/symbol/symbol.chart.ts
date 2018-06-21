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
import * as ecbones from '../../adapters/ecbones'
import * as alerts from '../../adapters/alerts'
import socket from '../../adapters/socket'
import colors from '../../stores/colors'



@Vts.Component
class VSymbolEChart extends Mixins(VEChartsMixin) {

	@Vts.Prop() quote: Quotes.Quote
	@Vts.Prop() range: string
	@Vts.Prop() axis: 'category' | 'time'

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

		let bones = ecbones.option({
			dataset: [{ source: lquotes }],
			toolbox: { itemSize: 0, feature: { dataZoom: { show: true, yAxisIndex: false } } },
			tooltip: [{
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
			}],
		})

		bones.dataZoom.push(ecbones.dataZoom('inside', { xAxisIndex: [0, 1] }))
		bones.dataZoom.push(ecbones.dataZoom('slider', { xAxisIndex: [0, 1] }))

		bones.grid.push({
			top: 8,
			left: 64,
			right: 64,
			bottom: 92,
			show: true,
			backgroundColor: colors.white,
			borderWidth: 0,
			// borderColor: colors['grey-lighter'],
		})
		bones.grid.push({
			height: 64,
			left: 64,
			right: 64,
			bottom: 92,
		})

		bones.xAxis.push(ecbones.axis('x', { type: this.axis }))
		bones.xAxis.push(ecbones.axis('x', { blank: true, type: this.axis, gridIndex: 1 }))

		bones.yAxis.push(ecbones.axis('y', {
			axisPointer: {
				label: {
					formatter: params => pretty.number(params.value) + '\n' + pretty.number(core.calc.percent(params.value, this.ctprice), { percent: true, plusminus: true })
				}
			},
		}))
		bones.yAxis.push(ecbones.axis('y', { blank: true, gridIndex: 1 }))

		bones.series.push(ecbones.series({
			name: 'OHLC',
			type: 'candlestick',
			large: true,
			encode: {
				x: 'timestamp',
				y: ['open', 'close', 'high', 'low'],
				tooltip: ['open', 'high', 'low', 'close'],
			},
			itemStyle: {
				borderColor: colors.success, borderColor0: colors.danger, borderWidth: 1,
				color: colors.success, color0: colors.danger,
			},
		}))

		bones.series.push(ecbones.series({
			name: 'Size',
			type: 'bar',
			xAxisIndex: 1,
			yAxisIndex: 1,
			large: true,
			encode: {
				x: 'timestamp',
				y: 'size',
				tooltip: 'size',
			},
		}))

		console.log(`build bones ->`, JSON.parse(JSON.stringify(bones)))
		this.echart.setOption(bones)
		setTimeout(() => console.log(`echart build ->`, Date.now() - stamp + 'ms'), 0)
		// console.log(`build getOption ->`, JSON.parse(JSON.stringify(this.echart.getOption())))
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


