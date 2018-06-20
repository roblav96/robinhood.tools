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
		this.echart.off('hidetip')
		this.echart.off('showtip')
		this.echart.off('datazoom')
		this.echart.off('click')
		this.echart.clear()
		this.echart.dispose()
		this.echart = null
		this.onresize_.cancel()
		this.ondatazoom_.cancel()
	}



	getOption() { return this.echart._model.option }
	ctbounds() {
		let datazoom = this.getOption().dataZoom[0]
		return {
			start: datazoom.start, startValue: datazoom.startValue,
			end: datazoom.end, endValue: datazoom.endValue,
		}
	}
	updateOption(option: Partial<echarts.Option>, opts?: Partial<echarts.OptionOptions>) {
		let merged = deepmerge(this.echart.getOption(), option)
		// console.log('updateOption option ->', option, 'merged ->', merged)
		this.echart.setOption(merged, opts)
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
		this.echart.setOption({ tooltip: [{ show: !brushing }] })
		if (brushing) this.echart.dispatchAction({ type: 'hideTip' });
	}



	onkeydown_(event: KeyboardEvent) {
		// if (event.shiftKey && event.key == 'Shift') {
		// 	this.brushing = true
		// }
	}
	onkeyup_(event: KeyboardEvent) {
		if (event.key == 'Escape' || event.key == 'Shift') {
			this.brushing = false
		}
	}



	ondatazoom_ = _.debounce(this.datazoom_, 100, { leading: true, trailing: false })
	datazoom_(event: echarts.EventData) {
		this.brushing = false
		this.echart.setOption({ tooltip: [{ show: false }] })
		this.echart.dispatchAction({ type: 'hideTip' })
	}
	ondatazoom__ = _.debounce(this.datazoom__, 100, { leading: false, trailing: true })
	datazoom__(event: echarts.EventData) {
		this.echart.setOption({ tooltip: [{ show: true }] })
	}



	dims() { return { width: this.$el.offsetWidth, height: this.$el.offsetHeight } as echarts.Dims }
	onresize_ = _.debounce(this.resize_, 300, { leading: false, trailing: true })
	resize_() {
		this.echart.resize(this.dims())
	}



	onclick_() {
		this.brushing = false
	}

	ontap(event: HammerEvent) {
		let contains = this.echart.containPixel({ gridIndex: 'all' }, [event.srcEvent.offsetX, event.srcEvent.offsetY])
		if (event.tapCount == 1) {
			this.brushing = !this.brushing && contains
		}
		if (event.tapCount == 2) {
			if (contains) {
				this.echart.dispatchAction({ type: 'dataZoom', start: 0, end: 100 })
			}
		}
	}



	onwheel_ = utils.raf(this.onwheel)
	onwheel(event: WheelEvent) {
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
	reshowtip() {
		if (!this.tippos || !this.tippos.show) return;
		_.defer(() => this.echart.dispatchAction({ type: 'showTip', x: this.tippos.x, y: this.tippos.y }))
	}



}


