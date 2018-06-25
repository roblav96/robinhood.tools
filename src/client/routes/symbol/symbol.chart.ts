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
import { theme } from '../../stores/colors'



@Vts.Component
class VSymbolEChart extends Mixins(VEChartsMixin) {

	$parent: VSymbolChart
	@Vts.Prop() quote: Quotes.Quote
	@Vts.Prop() settings: typeof VSymbolChart.prototype.settings

	mounted() {

	}
	beforeDestroy() {

	}



	lquotes() { return _.get(this.getOption(), 'dataset[0].source', []) as Quotes.Live[] }

	ctprice() {
		let lquotes = this.lquotes()
		let ctbounds = this.ctbounds()
		let lquote = this.settings.time ? lquotes.find(v => v.timestamp >= ctbounds.startValue) : lquotes[ctbounds.startValue]
		return this.settings.ohlc ? lquote.open : lquote.price
	}

	ctlatest() {
		let lquotes = this.lquotes()
		let bounds = { end: 100 } as ReturnType<typeof VEChartsMixin.prototype.ctbounds>
		let threshold = Math.round(utils.screen().width / 10)
		if (this.settings.time) {
			let i = core.math.clamp(lquotes.length - threshold, 0, lquotes.length)
			bounds.startValue = lquotes[i].timestamp
		} else {
			bounds.start = core.math.clamp(core.calc.slider(lquotes.length - threshold, 0, lquotes.length), 0, 100)
		}
		return bounds
	}
	latestzoom() {
		this.echart.dispatchAction(Object.assign({ type: 'dataZoom', manual: true }, this.ctlatest()))
	}



	@Vts.Watch('settings.time') w_time() { this.reload() }
	@Vts.Watch('settings.ohlc') w_ohlc() { this.reload() }

	reload = _.debounce(this.reload_, 100, { leading: false, trailing: true })
	reload_() {
		let ctbounds = this.ctbounds()
		let lquotes = this.lquotes()
		this.echart.clear()
		this.build(lquotes)
		this.echart.dispatchAction(Object.assign({ type: 'dataZoom', manual: true }, ctbounds))
	}

	build(lquotes = this.lquotes()) {
		let stamp = Date.now()

		let option = ecbones.option({
			dataset: [{ source: lquotes }],
			toolbox: { itemSize: 0, feature: { dataZoom: { show: true, yAxisIndex: false } } },
			tooltip: [{ formatter: params => charts.tipFormatter(params as any, this.getOption()) }],
		})

		option.dataZoom.push(ecbones.dataZoom({ type: 'inside' }, { xAxisIndex: [0] }))
		option.dataZoom.push(ecbones.dataZoom({ type: 'slider' }, { xAxisIndex: [0] }))

		option.grid.push({
			top: 8,
			left: 64,
			right: 64,
			bottom: 92,
			show: true,
			backgroundColor: theme.white,
			borderWidth: 0,
			// borderColor: theme['grey-lighter'],
		})
		// option.grid.push({
		// 	height: 64,
		// 	left: 64,
		// 	right: 64,
		// 	bottom: 92,
		// })

		let xtype = this.settings.time ? 'time' : 'category'
		option.xAxis.push(ecbones.axis({ xy: 'x' }, {
			type: xtype,
		}))
		// option.xAxis.push(ecbones.axis({ xy: 'x', blank: true }, {
		// 	type: xtype,
		// 	gridIndex: 1,
		// }))

		option.yAxis.push(ecbones.axis({ xy: 'y' }, {
			boundaryGap: '1%',
			axisPointer: { label: { formatter: this.yAxisPointerFormatter } },
		}))
		// option.yAxis.push(ecbones.axis({ xy: 'y', blank: true }, {
		// 	gridIndex: 1,
		// }))

		let priceseries = this.settings.ohlc ? ecbones.candlestick({
			name: 'OHLC',
			encode: {
				x: 'timestamp',
				y: ['open', 'close', 'high', 'low'],
				tooltip: ['open', 'high', 'low', 'close'],
			},
		}) : ecbones.line({ color: theme.primary, width: 1.5 }, {
			name: 'Price',
			encode: { x: 'timestamp', y: 'price', tooltip: 'price' },
		})
		priceseries.markLine = { data: [] }
		if (this.$parent.rangeindex <= 1) {
			priceseries.markLine = ecbones.markLine({ data: this.markDataPrice() })
		}
		option.series.push(priceseries)

		// option.series.push(ecbones.bar({ color: theme['grey-lighter'] }, {
		// 	name: 'Size',
		// 	xAxisIndex: 1,
		// 	yAxisIndex: 1,
		// 	encode: { x: 'timestamp', y: 'size', tooltip: 'size' },
		// }))

		console.log(`build bones ->`, _.clone(option))
		this.echart.setOption(option)
		console.log(`build getOption ->`, _.clone(this.echart.getOption()))

		_.defer(() => console.log(`echart build ->`, lquotes.length, Date.now() - stamp + 'ms'))
	}

	onlquote(lquote: Quotes.Live) {
		if (!this.rendered) return;
		let lquotes = this.lquotes()
		let last = lquotes[lquotes.length - 1]
		if (last.liveCount == lquote.liveCount) {
			core.object.merge(last, lquote)
		} else lquotes.push(lquote);
		this.setOption({ dataset: [{ source: lquotes }] })
		this.reshowtip()
	}



	yAxisPointerFormatter(params: echarts.AxisPointerParams) {
		return pretty.number(params.value) + '\n' + pretty.number(core.calc.percent(params.value, this.ctprice()), { percent: true, plusminus: true })
	}
	markDataPrice() {
		let color = theme['grey-light']
		if (this.quote.change > 0) color = theme.success;
		if (this.quote.change < 0) color = theme.danger;
		return [{
			// yAxis: this.quote.startPrice,
			// }, {
			yAxis: this.quote.price,
			lineStyle: { color },
			label: {
				position: 'end',
				backgroundColor: color,
				color: theme.white,
				borderColor: theme.white,
				formatter: v => pretty.number(v.value, { price: true }),
			},
		}] as echarts.MarkData[]
	}



}



@Vts.Component({
	components: { 'v-symbol-echart': VSymbolEChart },
})
export default class VSymbolChart extends Mixins(VMixin) {

	$parent: VSymbol
	@Vts.Prop() symbol: string
	@Vts.Prop() quote: Quotes.Quote

	brushing = false
	get vechart() { return this.$refs['symbol_vechart'] as VSymbolEChart }

	mounted() {
		this.getQuotes()
	}
	beforeDestroy() {
		socket.offListener(this.vechart.onlquote)
	}



	busy = true
	@Vts.Watch('quote.tickerId') w_tickerId() { this.getQuotes() }

	getQuotes() {
		if (!Number.isFinite(this.quote.tickerId)) return;
		this.busy = true
		this.buildDatasets()
		return Promise.resolve().then(() => {
			if (this.settings.range == 'live') {
				return http.post('/quotes/lives', { symbols: [this.quote.symbol] }).then(response => response[0])
			}
			return charts.getChart(this.quote, this.settings.range)
		}).then((lquotes: Quotes.Live[]) => {
			this.$safety()
			socket.offListener(this.vechart.onlquote)
			if (lquotes.length == 0) {
				alerts.toast(`Data for range '${core.string.capitalize(this.settings.range)}' not found!`)
				this.vechart.echart.clear()
				return
			}
			this.vechart.build(lquotes)
			if (this.settings.range == 'live') {
				socket.on(`${rkeys.LIVES}:${this.quote.symbol}`, this.vechart.onlquote)
			}
		}).catch(error => {
			console.error(`getQuotes Error ->`, error)
		}).finally(() => {
			this.busy = false
		})
	}

	@Vts.Watch('quote', { deep: true }) w_quote(quote: Quotes.Quote) {
		if (this.settings.range != 'live' || quote.size == 0) return;
		let lquote = quotes.getConverted(quote, quotes.ALL_LIVE_KEYS) as Quotes.Live
		lquote.liveCount++
		this.vechart.onlquote(lquote)
	}



	settings = lockr.get('symbol.chart.settings', {
		range: yahoo.RANGES[2] as keyof typeof yahoo.FRAMES | 'live',
		ohlc: true,
		time: false,
	})
	@Vts.Watch('settings', { deep: true }) w_settings(settings: typeof VSymbolChart.prototype.settings) {
		lockr.set('symbol.chart.settings', settings)
	}

	ranges = ['live'].concat(yahoo.RANGES)
	get rangeindex() { return this.ranges.indexOf(this.settings.range) }
	vrange(range: string) { return charts.range(range) }
	@Vts.Watch('settings.range') w_settingsrange(range: string) {
		this.getQuotes()
	}



	tags = []
	typing(text: string) {
		console.log(`text ->`, text)
		return text
	}

	datasets = []
	buildDatasets() {
		this.datasets = quotes.ALL_LIVE_KEYS.filter(k => Number.isFinite(this.quote[k as any]))
		console.log('this.datasets ->', this.datasets)
	}

	editds(ds) {
		console.log(`ds ->`, ds)
	}



}


