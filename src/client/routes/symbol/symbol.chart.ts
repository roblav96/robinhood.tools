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
	@Vts.Prop() settings: typeof VSymbolChart.prototype.settings

	mounted() {

	}
	beforeDestroy() {

	}



	lquotes() { return _.get(this.getOption(), 'dataset[0].source', []) as Quotes.Live[] }

	@VMixin.NoCache get ctprice() {
		let lquotes = this.lquotes()
		let ctbounds = this.ctbounds()
		let lquote = lquotes[core.math.clamp(Math.floor(lquotes.length * (ctbounds.start / 100)), 0, lquotes.length - 1)]
		if (this.settings.axis == 'category') lquote = lquotes[ctbounds.startValue];
		if (this.settings.axis == 'time') lquote = lquotes.find(v => v.timestamp >= ctbounds.startValue);
		return this.settings.ohlc ? lquote.open : lquote.price
	}



	@Vts.Watch('settings.ohlc') w_ohlc() {
		let lquotes = this.lquotes()
		this.echart.clear()
		this.build(lquotes)
	}
	@Vts.Watch('settings.axis') w_axis() {
		let lquotes = this.lquotes()
		this.echart.clear()
		this.build(lquotes)
	}

	build(lquotes = this.lquotes()) {
		let stamp = Date.now()

		let bones = ecbones.option({
			dataset: [{ source: lquotes }],
			toolbox: { itemSize: 0, feature: { dataZoom: { show: true, yAxisIndex: false } } },
			tooltip: [{ formatter: params => charts.tipformatter(params as any, this.getOption()) }],
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

		bones.xAxis.push(ecbones.axis('x', { type: this.settings.axis }))
		bones.xAxis.push(ecbones.axis('x', { type: this.settings.axis, gridIndex: 1, blank: true }))

		bones.yAxis.push(ecbones.axis('y', {
			boundaryGap: '1%',
			axisPointer: { label: { formatter: params => pretty.number(params.value) + '\n' + pretty.number(core.calc.percent(params.value, this.ctprice), { percent: true, plusminus: true }) } },
		}))
		bones.yAxis.push(ecbones.axis('y', { gridIndex: 1, blank: true }))

		if (this.settings.ohlc) {
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
		} else {
			bones.series.push(ecbones.series({
				name: 'Price',
				type: 'line',
				encode: { x: 'timestamp', y: 'price', tooltip: 'price' },
				itemStyle: { color: colors.primary },
			}))
		}

		bones.series.push(ecbones.series({
			name: 'Size',
			type: 'bar',
			xAxisIndex: 1,
			yAxisIndex: 1,
			large: true,
			encode: { x: 'timestamp', y: 'size', tooltip: 'size' },
		}))

		console.log(`build bones ->`, _.clone(bones))
		this.echart.setOption(bones)
		console.log(`build getOption ->`, _.clone(this.echart.getOption()))

		_.defer(() => console.log(`echart build ->`, Date.now() - stamp + 'ms'))
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



}



@Vts.Component({
	components: { 'v-symbol-echart': VSymbolEChart },
})
export default class VSymbolChart extends Mixins(VMixin) {

	brushing = false
	@VMixin.NoCache get vechart() { return (this.$refs as any)['symbol_vechart'] as VSymbolEChart }

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
				this.vechart.latestzoom()
				socket.on(`${rkeys.LIVES}:${this.quote.symbol}`, this.vechart.onlquote)
			} else this.vechart.resetzoom();
		}).catch(error => {
			console.error(`getQuotes Error ->`, error)
		}).finally(() => {
			this.busy = false
		})
	}

	@Vts.Prop() quote: Quotes.Quote
	@Vts.Watch('quote', { deep: true }) w_quote(quote: Quotes.Quote) {
		if (this.settings.range != 'live' || quote.size == 0) return;
		let lquote = quotes.getConverted(quote, quotes.ALL_LIVE_KEYS) as Quotes.Live
		lquote.liveCount++
		this.vechart.onlquote(lquote)
	}



	settings = lockr.get('symbol.chart.settings', {
		range: yahoo.RANGES[2],
		ohlc: true,
		axis: 'category' as 'category' | 'time',
	})
	@Vts.Watch('settings', { deep: true }) w_settings(settings: typeof VSymbolChart.prototype.settings) {
		lockr.set('symbol.chart.settings', settings)
	}

	ranges = ['live'].concat(yahoo.RANGES)
	vrange(range: string) { return charts.range(range) }
	@Vts.Watch('settings.range') w_settingsrange(range: string) {
		this.getQuotes()
	}

	resetzoom() { this.vechart.resetzoom() }
	latestzoom() { this.vechart.latestzoom() }



}


