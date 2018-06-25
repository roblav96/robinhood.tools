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
import clock from '../../../common/clock'
import socket from '../../adapters/socket'
import { theme } from '../../stores/colors'



@Vts.Component
export class VSymbolEChart extends Mixins(VEChartsMixin) {

	$parent: VSymbolChart

	lquotes: Quotes.Live[]
	get busy() { return this.$parent.busy }
	get quote() { return this.$parent.quote }
	get settings() { return this.$parent.settings }
	get brushing() { return this.$parent.brushing }
	set brushing(brushing: boolean) { this.$parent.brushing = brushing }

	mounted() {

	}
	beforeDestroy() {
		core.nullify(this.lquotes)
	}



	ctprice() {
		let ctbounds = this.ctbounds()
		let lquote = this.settings.time ? this.lquotes.find(v => v.timestamp >= ctbounds.startValue) : this.lquotes[ctbounds.startValue]
		return this.settings.ohlc ? lquote.open : lquote.close
	}
	ctlatest(large = false) {
		let bounds = { end: 100 } as ReturnType<typeof VEChartsMixin.prototype.ctbounds>
		let threshold = large == true ? ecbones.SETTINGS.largeThreshold() - 4 : ecbones.SETTINGS.latestThreshold()
		if (this.settings.time) {
			let i = core.math.clamp(this.lquotes.length - threshold, 0, this.lquotes.length)
			bounds.startValue = this.lquotes[i].timestamp
		} else {
			bounds.start = core.math.clamp(core.calc.slider(this.lquotes.length - threshold, 0, this.lquotes.length), 0, 100)
		}
		return bounds
	}
	latestzoom(large = false) {
		this.echart.dispatchAction(Object.assign({ type: 'dataZoom' }, this.ctlatest(large)))
	}



	init(lquotes: Quotes.Live[]) {
		this.lquotes = lquotes
		this.build()
		this.resetzoom()
	}

	build() {
		let stamp = Date.now()

		let option = ecbones.option({
			toolbox: { itemSize: 0, feature: { dataZoom: { show: true, yAxisIndex: false } } },
			tooltip: [{ formatter: params => charts.tipFormatter(params as any, this.getOption()) }],
		})

		option.dataZoom.push(ecbones.dataZoom({ type: 'inside' }, {}))
		option.dataZoom.push(ecbones.dataZoom({ type: 'slider' }, {
			height: ecbones.SETTINGS.dataZoom.height,
		}))



		option.grid.push({
			top: 6,
			left: ecbones.SETTINGS.padding.x,
			right: ecbones.SETTINGS.padding.x,
			bottom: ecbones.SETTINGS.primary.bottom,
			show: true,
			backgroundColor: theme.white,
			borderWidth: 0,
		})

		let xtype = this.settings.time ? 'time' : 'category'
		option.xAxis.push(ecbones.axis({ xy: 'x' }, {
			type: xtype,
		}))

		option.yAxis.push(ecbones.axis({ xy: 'y' }, {
			boundaryGap: '1%',
			axisPointer: { label: { formatter: this.ecYAxisPointerFormatter } },
		}))

		let primary = this.settings.ohlc ? ecbones.candlestick({
			name: 'OHLC',
			encode: {
				x: 'timestamp',
				y: ['open', 'close', 'high', 'low'],
				tooltip: ['open', 'high', 'low', 'close'],
			},
		}) : ecbones.line({ color: theme.primary, width: 1.5 }, {
			name: 'Price',
			encode: { x: 'timestamp', y: 'close', tooltip: 'close' },
		})
		primary.markLine = ecbones.markLine({ data: this.ecPriceMarkData() })
		option.series.push(primary)



		// option.grid.push({
		// 	height: '20%',
		// 	left: ecbones.SETTINGS.padding.x,
		// 	right: ecbones.SETTINGS.padding.x,
		// 	bottom: ecbones.SETTINGS.primary.bottom,
		// })
		// option.yAxis.push(ecbones.axis({ xy: 'y', blank: true }, {
		// 	gridIndex: 1,
		// }))
		// option.xAxis.push(ecbones.axis({ xy: 'x', blank: true }, {
		// 	type: xtype,
		// 	gridIndex: 1,
		// }))

		// option.series.push(ecbones.candlestick({
		// 	name: 'Size',
		// 	xAxisIndex: 1,
		// 	yAxisIndex: 1,
		// 	datasetIndex: 1,
		// 	encode: {
		// 		x: 'timestamp',
		// 		y: ['open', 'close', 'high', 'low'],
		// 		tooltip: 'size',
		// 	},
		// }))



		let grids = option.xAxis.map((v, i) => i)
		console.log('grids ->', grids)
		option.dataZoom.forEach(v => v.xAxisIndex = grids)
		option.dataset = this.ecDatasets()



		// console.log(`build bones ->`, _.clone(option))
		this.echart.setOption(option)
		// console.log(`build getOption ->`, _.clone(this.echart.getOption()))

		_.defer(() => console.log(`echart build ->`, this.lquotes.length, Date.now() - stamp + 'ms'))
	}

	sync() {
		this.setOption({
			dataset: this.ecDatasets(),
			series: [{ markLine: { data: this.ecPriceMarkData() } }],
		})
		this.reshowtip()
	}



	@Vts.Watch('settings.time') w_time() { this.reload() }
	@Vts.Watch('settings.ohlc') w_ohlc() { this.reload() }
	// onreload = _.debounce(this.reload, 100, { leading: false, trailing: true })
	reload() {
		let ctbounds = this.ctbounds()
		this.echart.clear()
		this.build()
		this.echart.dispatchAction(Object.assign({ type: 'dataZoom' }, ctbounds))
	}



	ecYAxisPointerFormatter(params: echarts.AxisPointerParams) {
		return pretty.number(params.value) + '\n' + pretty.number(core.calc.percent(params.value, this.ctprice()), { percent: true, plusminus: true })
	}

	ecDatasets() {
		return [
			{ source: this.lquotes },
			{
				source: core.clone(this.lquotes).map(lquote => {
					if (lquote.close > lquote.open) {
						lquote.open = 0
						lquote.close = lquote.size
					} else {
						lquote.close = 0
						lquote.open = lquote.size
					}
					lquote.low = 0
					lquote.high = lquote.size
					return lquote
				})
			},
		] as echarts.Dataset[]
	}

	ecPriceMarkData() {
		if (this.$parent.rangeindex > 1) return [];
		let color = theme['grey-light']
		if (this.quote.change > 0) color = theme.success;
		if (this.quote.change < 0) color = theme.danger;
		return [{
			// 	yAxis: this.quote.startPrice,
			// 	label: { formatter: v => pretty.number(v.value, { price: true }) },
			// }, {
			yAxis: this.quote.close,
			lineStyle: { color },
			label: {
				backgroundColor: color,
				color: theme.white,
				borderWidth: 0,
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
	@Vts.Prop() quote: Quotes.Quote

	brushing = false
	get vechart() { return this.$refs['symbol_vechart'] as VSymbolEChart }

	mounted() {
		this.getQuotes()
	}
	beforeDestroy() {
		this.cleanup()
	}



	busy = true
	@Vts.Watch('quote.tickerId') w_tickerId() { this.getQuotes() }

	cleanup() {
		clock.offListener(this.sync1day)
		socket.offListener(this.onlquote)
	}

	getQuotes() {
		if (!Number.isFinite(this.quote.tickerId)) return;
		this.busy = true
		return Promise.resolve().then(() => {
			if (this.settings.range == 'live') {
				return http.post('/quotes/lives', { symbols: [this.quote.symbol] }).then(response => response[0])
			}
			return charts.getChart(this.quote, this.settings.range)
		}).then((lquotes: Quotes.Live[]) => {
			this.$safety()
			this.cleanup()
			if (lquotes.length == 0) {
				alerts.toast(`Data for range '${core.string.capitalize(this.settings.range)}' not found!`)
				this.vechart.echart.clear()
				return
			}
			this.vechart.init(lquotes)
			if (this.settings.range == 'live') {
				socket.on(`${rkeys.LIVES}:${this.quote.symbol}`, this.onlquote)
			} else if (this.settings.range == '1d') {
				clock.on('5s', this.sync1day)
			}
		}).catch(error => {
			console.error(`getQuotes Error ->`, error)
		}).finally(() => {
			this.busy = false
		})
	}

	sync1day() {
		charts.getChart(this.quote, this.settings.range).then((lquotes: Quotes.Live[]) => {
			this.$safety()
			if (lquotes.length == 0) return;
			// let diff = core.object.difference(this.vechart.lquotes.slice(-1)[0], lquotes.slice(-1)[0])
			// if (Object.keys(diff).length == 0) return;
			this.vechart.lquotes = lquotes
			this.vechart.sync()
		}).catch(error => console.error(`sync1day Error ->`, error))
	}

	@Vts.Watch('quote', { deep: true }) w_quote(quote: Quotes.Quote) {
		if (this.settings.range != 'live' || !quote.size) return;
		let lquote = quotes.getConverted(quote, quotes.ALL_LIVE_KEYS) as Quotes.Live
		lquote.liveCount++
		this.onlquote(lquote)
	}
	onlquote(lquote: Quotes.Live) {
		if (this.busy) return;
		let lquotes = this.vechart.lquotes
		let last = lquotes[lquotes.length - 1]
		if (last.liveCount == lquote.liveCount) {
			core.object.merge(last, lquote)
		} else lquotes.push(lquote);
		this.vechart.sync()
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

	editds(ds) {
		console.log(`ds ->`, ds)
	}
	ontagclick(event) {
		console.log(`ontagclick ->`, event)
	}



}


