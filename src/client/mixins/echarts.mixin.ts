// 

import * as benchmark from '../../common/benchmark'
import * as Vts from 'vue-property-decorator'
import { mixins as Mixins } from 'vue-class-component'
import Vue from 'vue'
import VMixin from './v.mixin'
import deepmerge from 'deepmerge'
import * as lockr from 'lockr'
import * as echarts from 'echarts'
import * as ecstat from 'echarts-stat'
import * as Hammer from 'hammerjs'
import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as utils from '../adapters/utils'
import * as pretty from '../adapters/pretty'



@Vts.Component({
	template: `
		<div
			v-touch:tap="ontap"
		></div>
	`,
})
export default class VEChartsMixin extends Vue {

	echart: echarts.ECharts

	created() {
		this.tippos = { show: false }
	}
	mounted() {
		this.echart = echarts.init(this.$el, null, this.dims())
		this.echart.one('rendered', this.onrendered_)
		this.echart.on('click', this.onclick_)
		this.echart.on('datazoom', this.ondatazoom_)
		this.echart.on('datazoom', this.ondatazoom__)
		this.echart.on('showtip', this.onshowtip_)
		this.echart.on('hidetip', this.onhidetip_)
		this.$el.addEventListener('wheel', this.onwheel_, { passive: true })
		utils.wemitter.on('resize', this.onresize_, this)
		utils.wemitter.on('keydown', this.onkeydown_, this)
		utils.wemitter.on('keyup', this.onkeyup_, this)
		if (process.env.DEVELOPMENT) module.hot.addStatusHandler(this.onresize_);
	}
	beforeDestroy() {
		if (process.env.DEVELOPMENT) module.hot.removeStatusHandler(this.onresize_);
		utils.wemitter.off('keyup', this.onkeyup_, this)
		utils.wemitter.off('keydown', this.onkeydown_, this)
		utils.wemitter.off('resize', this.onresize_, this)
		this.$el.removeEventListener('wheel', this.onwheel_)
		Object.keys(this.echart._$handlers).forEach(k => this.echart.off(k as any))
		this.echart.clear()
		this.echart.dispose()
		this.echart = null
		this.onresize_.cancel()
		this.ondatazoom_.cancel()
		this.ondatazoom__.cancel()
	}

	rendered = false
	onrendered_() { this.rendered = true }



	getOption() { return this.echart._model.option }
	setOption(option: Partial<echarts.Option>, opts?: Partial<echarts.OptionOptions>) {
		let stamp = Date.now()
		this.echart.setOption(option, opts)
		_.defer(() => console.log(`setOption ->`, Date.now() - stamp + 'ms'))
	}
	updateOption(option: Partial<echarts.Option>, opts?: Partial<echarts.OptionOptions>) {
		// let merged = deepmerge(this.echart.getOption(), option)
		let merged = _.merge(this.echart.getOption(), option)
		// console.log('updateOption option ->', option, 'merged ->', merged)
		this.setOption(merged, opts)
	}

	ctbounds() {
		let datazoom = this.getOption().dataZoom[0]
		return {
			start: datazoom.start, startValue: datazoom.startValue,
			end: datazoom.end, endValue: datazoom.endValue,
		}
	}
	splitnumber(height = this.echart.getHeight()) { return Math.round(height / 64) }



	shiftkey: boolean
	onkeydown_(event: KeyboardEvent) {
		if (event.shiftKey && event.key == 'Shift') {
			this.shiftkey = true
		}
	}
	onkeyup_(event: KeyboardEvent) {
		if (event.key == 'Shift') {
			this.shiftkey = false
		}
		if (event.key == 'Escape') {
			this.brushing = false
		}
	}



	@Vts.Prop({ default: false }) isbrushing: boolean
	get brushing() { return this.isbrushing }
	set brushing(brushing: boolean) { this.$emit('update:isbrushing', brushing) }
	@Vts.Watch('brushing') w_brushing(brushing: boolean) {
		this.echart.dispatchAction({
			type: 'takeGlobalCursor',
			key: 'dataZoomSelect',
			dataZoomSelectActive: brushing,
		})
		let mods = {} as echarts.Option
		if (!brushing) {
			let ctbounds = this.ctbounds()
			if (ctbounds.start > 0 && ctbounds.end == 100) {
				mods.dataZoom = [{ start: ctbounds.start, end: ctbounds.end }]
			}
		}
		this.syncshowtip(!brushing, mods)
	}



	ondatazoom_ = _.debounce(this.datazoom_, 100, { leading: true, trailing: false })
	datazoom_(event: echarts.EventData) {
		if (event.manual) return;
		// console.log('leading event ->', event)
		this.syncshowtip(false)
	}
	ondatazoom__ = _.debounce(this.datazoom__, 100, { leading: false, trailing: true })
	datazoom__(event: echarts.EventData) {
		// console.log('trailing event ->', event)
		if (this.brushing) return this.brushing = false;
		this.syncshowtip(true)
		let keys = Object.keys(event)
		if (keys.length == 3 && keys.includes('start') && keys.includes('end')) {
			this.echart.dispatchAction({ type: 'showTip', x: this.tippos.x, y: this.tippos.y })
		}
	}
	resetzoom() {
		this.echart.dispatchAction({ type: 'dataZoom', start: 0, end: 100, manual: true })
	}



	dims() {
		return {
			width: Math.max(this.$el.offsetWidth, 256),
			height: Math.max(this.$el.offsetHeight, 128),
		} as echarts.Dims
	}
	onresize_ = _.debounce(this.resize_, 100, { leading: false, trailing: true })
	resize_() {
		this.echart.resize(this.dims())
	}



	onclick_() {
		// this.brushing = false
	}

	ontap(event: HammerEvent) {
		let contains = this.echart.containPixel({ gridIndex: 'all' }, [event.srcEvent.offsetX, event.srcEvent.offsetY])
		if (!contains) return;
		if (event.tapCount == 1) {
			this.brushing = !this.brushing && this.shiftkey
		}
		if (event.tapCount == 2) {
			let x = core.calc.slider(event.srcEvent.offsetX, 0, this.echart.getWidth())
			x > 90 ? this.latestzoom() : this.resetzoom()
		}
	}



	onwheel_ = utils.raf(this.onwheel)
	onwheel(event: WheelEvent) {
		if (this.shiftkey) return;
		if (Math.abs(event.wheelDeltaY) >= Math.abs(event.wheelDeltaX)) return;
		let contains = this.echart.containPixel({ gridIndex: 'all' }, [event.offsetX, event.offsetY])
		if (!contains) return;
		let deltaX = event.deltaX
		if (core.math.round(event.deltaX) == 0) return;
		let ctbounds = this.ctbounds()
		if (ctbounds.start == 0 && deltaX < 0) return;
		if (ctbounds.end == 100 && deltaX > 0) return;
		let zoomwidth = ctbounds.end - ctbounds.start
		if (zoomwidth == 100) return;
		let scale = (zoomwidth / (this.$el.offsetWidth * 0.5))
		deltaX = deltaX * scale
		this.echart.dispatchAction({
			type: 'dataZoom',
			start: core.math.clamp(ctbounds.start + deltaX, 0, 100 - zoomwidth),
			end: core.math.clamp(ctbounds.end + deltaX, zoomwidth, 100),
		})
	}



	tippos: Partial<{ show: boolean, x: number, y: number }>
	onshowtip_(event) { this.tippos = { show: true, x: event.x, y: event.y } }
	onhidetip_(event) { this.tippos ? this.tippos.show = false : this.tippos = { show: false } }
	showingtip() { return this.getOption().tooltip[0].show }
	syncshowtip(show: boolean, mods = {} as Partial<echarts.Option>) {
		this.echart.dispatchAction({ type: 'hideTip' })
		if (this.showingtip() != show) {
			// console.warn(`syncshowtip -> setOption tooltip`, show)
			this.setOption(_.merge({ tooltip: [{ show }] }, mods))
		}
	}
	reshowtip() {
		if (!this.tippos || !this.tippos.show) return;
		_.defer(() => this.echart.dispatchAction({ type: 'showTip', x: this.tippos.x, y: this.tippos.y }))
	}



}


