// 

import deepmerge from 'deepmerge'
import * as echarts from 'echarts'
import * as nanoid from 'nanoid'
import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as pretty from './pretty'
import * as charts from './charts'
import * as utils from './utils'
import { theme } from '../stores/colors'



const SETTINGS = {
	fontSize: 14,
	largeThreshold: Math.round(utils.screen().width / 8),
	progressiveThreshold: Math.round(utils.screen().width / 2),
}



export function option(
	mods = {} as Partial<echarts.Option>,
) {
	let option = {
		animation: false,
		progressive: SETTINGS.progressiveThreshold,
		progressiveThreshold: SETTINGS.progressiveThreshold,
		color: Array(16).fill(theme['grey-lighter']),
		textStyle: { color: theme.dark, fontSize: SETTINGS.fontSize },
		dataset: [],
		legend: { show: !!mods.legend },
		toolbox: { show: !!mods.toolbox },
		tooltip: [{
			show: true,
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
			// extraCssText: `border: 0.125rem solid ${theme['grey-darker']};`,
			axisPointer: {
				type: 'cross',
				animation: false,
				shadowStyle: { opacity: 0 },
				lineStyle: { color: theme['grey-lighter'] },
				crossStyle: { color: theme['grey-light'] },
				label: {
					formatter(params) { return charts.xlabel(params.value) },
					backgroundColor: theme.white, shadowBlur: 0, margin: 1,
					borderColor: theme['grey-light'], borderWidth: 1,
					textStyle: {
						color: theme.dark, borderRadius: 0,
						fontSize: SETTINGS.fontSize, padding: [4, 8], fontWeight: 'bold',
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
	} as echarts.Option
	return _.merge(option, mods) as echarts.Option
}



export function dataZoom(
	type: 'inside' | 'slider',
	mods = {} as Partial<echarts.DataZoom>,
) {
	let dataZoom = {
		type,
		throttle: 0,
	} as echarts.DataZoom
	if (type == 'inside') {
		_.merge(dataZoom, {
			preventDefaultMouseMove: false,
			zoomOnMouseWheel: 'shift',
		} as echarts.DataZoom)
	}
	if (type == 'slider') {
		_.merge(dataZoom, {
			showDetail: false,
			backgroundColor: theme.white,
			dataBackground: {
				areaStyle: { color: theme['white-bis'], opacity: 1 },
				lineStyle: { color: theme['grey-light'], opacity: 1 },
			},
			borderColor: theme['grey-lighter'],
			fillerColor: 'rgba(184,194,204,0.2)',
			textStyle: { color: theme.dark },
			handleStyle: { color: theme['grey-light'] },
			// handleIcon: 'M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
		} as echarts.DataZoom)
	}
	return _.merge(dataZoom, mods) as echarts.DataZoom
}



export function axis(
	xy: 'x' | 'y',
	mods = {} as Partial<{
		blank: boolean
	} & echarts.Axis>,
) {
	let axis = {
		silent: true,
		gridIndex: 0,
		uuid: nanoid(),
		// axisPointer: { show: true },
		axisLabel: { textStyle: { color: theme.dark, fontSize: SETTINGS.fontSize } },
		axisLine: { show: !!mods.axisLine },
		axisTick: { show: !!mods.axisTick },
		splitArea: { show: !!mods.splitArea },
		splitLine: { show: !!mods.splitLine },
	} as echarts.Axis
	if (xy == 'x') {
		_.merge(axis, {
			type: 'category',
			axisLabel: { margin: 5, formatter(v) { return charts.xlabel(v) } },
			// axisPointer: { label: { formatter(params) { return charts.xlabel(params.value) } } },
		} as echarts.Axis)
	}
	if (xy == 'y') {
		_.merge(axis, {
			scale: true,
			type: 'value',
			splitLine: { show: true, lineStyle: { color: theme['grey-lightest'] } },
			axisLabel: { formatter(v) { return pretty.number(v) } },
		} as echarts.Axis)
	}
	if (mods.blank) {
		delete mods.blank
		_.merge(axis, {
			axisLabel: { show: false },
			axisLine: { show: false },
			axisTick: { show: false },
			splitArea: { show: false },
			splitLine: { show: false },
			axisPointer: { type: 'none', label: { show: false } },
			// axisPointer: {
			// 	show: false,
			// 	status: 'hide',
			// 	type: 'none',
			// 	label: { show: false },
			// },
		} as echarts.Axis)
	}
	return _.merge(axis, mods) as echarts.Axis
}



export function series(
	mods = {} as Partial<echarts.Series>,
) {
	let series = {
		silent: true,
		animation: false,
		hoverAnimation: false,
		legendHoverLink: false,
		uuid: nanoid(),
		datasetIndex: 0,
		xAxisIndex: 0,
		yAxisIndex: 0,
		showSymbol: false,
		showAllSymbol: false,
		symbolSize: 4,
		emphasis: null,
		// emphasis: { label: null, itemStyle: null },
	} as echarts.Series
	if (mods.type == 'line') {
		_.merge(series, {
			lineStyle: { color: mods.itemStyle.color, width: 1 },
		} as echarts.Series)
	}
	if (mods.large) {
		_.merge(series, {
			largeThreshold: SETTINGS.largeThreshold,
			progressive: SETTINGS.progressiveThreshold,
			progressiveThreshold: SETTINGS.progressiveThreshold,
		} as echarts.Series)
	}
	return _.merge(series, mods) as echarts.Series
}



export function markLine(
	mods = {} as Partial<echarts.Mark>,
) {
	let markLine = {
		animation: false,
		label: {
			backgroundColor: theme.white, borderColor: theme['grey-light'], borderWidth: 1,
			textStyle: {
				color: theme.dark, borderRadius: 0,
				fontSize: SETTINGS.fontSize, padding: [4, 8], fontWeight: 'bold',
			},
		},
		lineStyle: { type: 'dashed', color: theme['grey-light'] },
		precision: -1,
		silent: true,
		symbol: 'none',
	} as echarts.Mark
	return _.merge(markLine, mods) as echarts.Mark
}



export function visualMap(
	mods = {} as Partial<echarts.VisualMap>,
) {
	let visualMap = {
		show: true,
		seriesIndex: 0,
		// pieces: [
		// 	{ min: 0, color: theme.success },
		// 	{ max: 0, color: theme.danger },
		// ],
	} as echarts.VisualMap
	return _.merge(visualMap, mods) as echarts.VisualMap
}


