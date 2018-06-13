// 

import * as benchmark from '../../common/benchmark'
import * as Vts from 'vue-property-decorator'
import { mixins as Mixins } from 'vue-class-component'
import Vue from 'vue'
import deepmerge from 'deepmerge'
import * as Hammer from 'hammerjs'
import * as echarts from 'echarts'
import * as ecstat from 'echarts-stat'
import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as utils from '../adapters/utils'
import * as pretty from '../adapters/pretty'



@Vts.Component({
	template: `
		<div>
			<div class="absolute"></div>
		</div>
	`,
})
export default class extends Vue {

	echart: echarts.ECharts
	colors = this.$store.state.colors

	mounted() {
		this.echart = echarts.init(this.$el.firstChild)
		this.echart.on('rendered', this.onrender)
		// this.echart.on('datazoom', this.ondatazoom)
		utils.wemitter.on('resize', this.onresize, this)
		utils.wemitter.on('keydown', this.onkeydown, this)
		utils.wemitter.on('keyup', this.onkeyup, this)
		this.$el.addEventListener('wheel', this.onwheel, { passive: true })
		this.$el.addEventListener('click', this.onclick)
		this.$el.addEventListener('dblclick', this.ondblclick)
		this.$once('rendered', this.doresize)
	}
	beforeDestroy() {
		this.$el.removeEventListener('dblclick', this.ondblclick)
		this.$el.removeEventListener('click', this.onclick)
		this.$el.removeEventListener('wheel', this.onwheel)
		utils.wemitter.off('keyup', this.onkeyup, this)
		utils.wemitter.off('keydown', this.onkeydown, this)
		utils.wemitter.off('resize', this.onresize, this)
		this.onresize.cancel()
		// this.echart.off('datazoom', this.ondatazoom)
		this.echart.clear()
		this.echart.dispose()
	}
	onrender(event) {
		console.log('event ->', event)
		this.echart.off('rendered', this.onrender)
		this.$emit('rendered')
	}



	dims() { return { width: this.$el.offsetWidth, height: this.$el.offsetHeight } as echarts.Dims }
	option() { return this.echart._model.option }
	ctbounds() {
		let datazoom = this.option().dataZoom[0]
		return {
			start: datazoom.start, startValue: datazoom.startValue,
			end: datazoom.end, endValue: datazoom.endValue,
		}
	}



	onresize = _.debounce(this.doresize, 300, { leading: false, trailing: true })
	doresize() { this.echart.resize(this.dims()) }

	onkeydown(event: KeyboardEvent) {
		if (!event.shiftKey || event.key != 'Shift') return;
		this.echart.dispatchAction({
			type: 'takeGlobalCursor',
			key: 'dataZoomSelect',
			dataZoomSelectActive: true,
		})
	}
	onkeyup(event: KeyboardEvent) {
		if (event.key != 'Shift') return;
		this.echart.dispatchAction({
			type: 'takeGlobalCursor',
			key: 'dataZoomSelect',
			dataZoomSelectActive: false,
		})
	}
	// ondatazoom(event: echarts.EventParam) {
	// 	// console.log(`event ->`, event)
	// }

	onclick(event: MouseEvent) { }
	ondblclick(event: MouseEvent) { this.resetZoom() }

	onwheel(event: WheelEvent) {
		if (Math.abs(event.wheelDeltaY) >= Math.abs(event.wheelDeltaX)) return;
		let contains = this.echart.containPixel({ gridIndex: 'all' }, [event.offsetX, event.offsetY])
		if (!contains) return;
		let deltaX = event.deltaX
		if (_.round(event.deltaX) == 0) return;
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


