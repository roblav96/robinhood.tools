// 

import deepmerge from 'deepmerge'
import * as echarts from 'echarts'
import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import colors from '../stores/colors'



const STYLES = {
	fontSize: 14,
}



export function blank(
	mods = {} as Partial<echarts.Option>,
) {
	return _.merge({
		animation: false,
		color: [colors['grey-lighter']],
		textStyle: { color: colors.dark, fontSize: STYLES.fontSize },
		dataset: [],
		legend: { show: !!mods.legend },
		toolbox: { show: !!mods.toolbox },
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
			hideDelay: 1,
			transitionDuration: 0,
			// padding: 0,
			padding: [0, 0, 0, 64],
			backgroundColor: 'transparent',
			// formatter: '{a}: {b1}<br>{c}: {d0}',
			// extraCssText: `border: 0.125rem solid ${colors['grey-darker']};`,
			axisPointer: {
				type: 'cross',
				animation: false,
				shadowStyle: { opacity: 0 },
				lineStyle: { color: colors['grey-lighter'] },
				crossStyle: { color: colors['grey-lighter'] },
				label: {
					backgroundColor: colors.white, shadowBlur: 0, margin: 1,
					borderColor: colors['grey-lighter'], borderWidth: 1,
					textStyle: {
						color: colors.dark, borderRadius: 0,
						fontSize: STYLES.fontSize, padding: [4, 8], fontWeight: 'bold',
					},
				},
			},
		}],
		axisPointer: [{
			link: [{ xAxisIndex: 'all' }],
		}],
		dataZoom: [],
		grid: [],
		xAxis: [],
		yAxis: [],
		series: [],
		visualMap: [],
	} as Partial<echarts.Option>, mods) as echarts.Option
}



export function dataZoom(
	type: 'inside' | 'slider',
	mods = {} as Partial<echarts.DataZoom>,
) {
	let dataZoom = {
		type,
		throttle: 0,
		xAxisIndex: [],
		yAxisIndex: [],
	} as echarts.DataZoom
	if (type == 'inside') {
		_.merge(dataZoom, {
			preventDefaultMouseMove: true,
			zoomOnMouseWheel: 'shift',
		} as echarts.DataZoom)
	}
	if (type == 'slider') {
		_.merge(dataZoom, {
			showDetail: false,
			backgroundColor: colors.white,
			dataBackground: {
				areaStyle: { color: colors['white-bis'], opacity: 1 },
				lineStyle: { color: colors['grey-light'], opacity: 1 },
			},
			borderColor: colors['grey-lighter'],
			fillerColor: 'rgba(184,194,204,0.2)',
			textStyle: { color: colors.dark },
			handleStyle: { color: colors['grey-lighter'] },
			// handleIcon: 'M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
		} as echarts.DataZoom)
	}
	return _.merge(dataZoom, mods) as echarts.DataZoom
}



export function axis(
	xy: 'x' | 'y',
	opts = {} as Partial<{
		blank: boolean
	}>,
	mods = {} as Partial<echarts.Axis>,
) {
	let axis = {
		silent: true,
		gridIndex: 0,
		uuid: Math.random().toString(16),
		axisLabel: {
			margin: 5,
			textStyle: { color: colors.dark, fontSize: STYLES.fontSize },
		},
		axisPointer: { show: true },
		axisLine: { show: !!mods.axisLine },
		axisTick: { show: !!mods.axisTick },
		splitArea: { show: !!mods.splitArea },
		splitLine: { show: !!mods.splitLine },
	} as echarts.Axis
	if (xy == 'x') {
		_.merge(axis, {
			type: 'category',
		} as echarts.Axis)
	}
	if (xy == 'y') {
		_.merge(axis, {
			scale: true,
			type: 'value',
		} as echarts.Axis)
	}
	if (opts.blank) {
		_.merge(axis, {
			axisLabel: { show: false },
			axisLine: { show: false },
			axisTick: { show: false },
			splitArea: { show: false },
			splitLine: { show: false },
			axisPointer: {
				show: false,
				status: 'hide',
				type: 'none',
				label: { show: false },
			},
		} as echarts.Axis)
	}
	return _.merge(axis, mods) as echarts.Axis
}











