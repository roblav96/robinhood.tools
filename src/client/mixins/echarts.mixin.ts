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
import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as utils from '../adapters/utils'
import * as pretty from '../adapters/pretty'



@Vts.Component({
	template: `
		<div>
			<div
				class="absolute"
				v-touch:tap="ontap"
				v-on:wheel="onwheel"
			></div>
		</div>
	`,
})
export default class extends Vue {

	colors = this.$store.state.colors

	mounted() {
		this.echart = echarts.init(this.$el.firstChild)
		this.echart.on('rendered', this.onrender_)
		this.echart.on('datazoom', this.ondatazoom_)
		utils.wemitter.on('resize', this.onresize_, this)
		utils.wemitter.on('keyup', this.onkeyup_, this)
		utils.wemitter.on('keydown', this.onkeydown_, this)
		if (process.env.DEVELOPMENT) module.hot.addStatusHandler(this.onresize_);
	}
	beforeDestroy() {
		if (process.env.DEVELOPMENT) module.hot.removeStatusHandler(this.onresize_);
		utils.wemitter.off('keydown', this.onkeydown_, this)
		utils.wemitter.off('keyup', this.onkeyup_, this)
		utils.wemitter.off('resize', this.onresize_, this)
		this.echart.off('datazoom', this.ondatazoom_)
		this.echart.off('rendered', this.onrender_)
		this.echart.clear()
		this.echart.dispose()
		this.echart = null
	}

	echart: echarts.ECharts
	onrender_() {
		this.echart.off('rendered', this.onrender_)
		this.$emit('rendered')
		this.resize()
	}



	// @VMixin.NoCache get option() { return this.echart._model.option }
	option() { return this.echart._model.option }
	ctbounds() {
		let datazoom = this.option().dataZoom[0]
		return {
			start: datazoom.start, startValue: datazoom.startValue,
			end: datazoom.end, endValue: datazoom.endValue,
		}
	}



	get brushing() { return (this.$parent as any).brushing }
	set brushing(brushing: boolean) { (this.$parent as any).brushing = brushing }
	@Vts.Watch('brushing') w_brushing(brushing: boolean) {
		this.echart.dispatchAction({
			type: 'takeGlobalCursor',
			key: 'dataZoomSelect',
			dataZoomSelectActive: brushing,
		})
		this.echart.setOption({ tooltip: { showContent: !brushing } })
	}
	onkeyup_(event: KeyboardEvent) {
		if (event.metaKey || event.shiftKey || event.ctrlKey || event.altKey) return;
		if (['Escape'].includes(event.key)) this.brushing = false;
	}
	onkeydown_(event: KeyboardEvent) {

	}

	ondatazoom_ = _.throttle(this.datazoom, 100, { leading: false, trailing: true })
	datazoom() {
		this.$emit('datazoom')
		this.brushing = false
		this.echart.dispatchAction({ type: 'hideTip' })
		// console.log(`this.echart ->`, this.echart)
	}

	dims() { return { width: this.$el.offsetWidth, height: this.$el.offsetHeight } as echarts.Dims }
	onresize_ = _.debounce(this.resize, 100, { leading: false, trailing: true })
	resize() {
		this.$emit('resize')
		this.echart.resize(this.dims())
	}

	ontap(event: HammerEvent) {
		let contains = this.echart.containPixel({ gridIndex: 'all' }, [event.srcEvent.offsetX, event.srcEvent.offsetY])
		if (event.tapCount == 1) {
			this.brushing = !this.brushing && contains
		}
		if (event.tapCount == 2) {
			if (contains) this.resetZoom();
		}
	}

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
		let start = core.math.clamp(ctbounds.start + deltaX, 0, 100 - zoomwidth)
		let end = core.math.clamp(ctbounds.end + deltaX, zoomwidth, 100)
		this.echart.dispatchAction({ type: 'dataZoom', start, end })
	}



	updateOption(option: Partial<echarts.Option>, opts?: Partial<echarts.OptionOptions>) {
		this.echart.setOption(deepmerge(this.echart.getOption(), option), opts)
	}
	resetZoom() {
		this.echart.dispatchAction({ type: 'dataZoom', start: 0, end: 100 })
	}



}





// type IMouseWheel = VEChartsMixin
// interface MouseWheel extends IMouseWheel { }
// @Vts.Component
// class MouseWheel extends Vue {
// 	mounted() {
// 		this.$el.addEventListener('wheel', this.onwheel, { passive: true })
// 	}
// 	beforeDestroy() {
// 		this.$el.removeEventListener('wheel', this.onwheel)
// 	}
// }


