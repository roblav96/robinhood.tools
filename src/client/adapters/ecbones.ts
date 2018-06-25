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



export const SETTINGS = {
	padding: { x: 68, y: 16 },
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
			padding: [0, 0, 0, 128],
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
					backgroundColor: theme.white, shadowBlur: 0, margin: 0,
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
	opts = {} as Partial<{
		type: 'inside' | 'slider'
	}>,
	mods = {} as Partial<echarts.DataZoom>,
) {
	let dataZoom = {
		type: opts.type,
		throttle: 0,
	} as echarts.DataZoom
	if (opts.type == 'inside') {
		dataZoom.preventDefaultMouseMove = false
		dataZoom.zoomOnMouseWheel = 'shift'
	}
	if (opts.type == 'slider') {
		dataZoom.showDetail = false
		dataZoom.backgroundColor = theme.white
		dataZoom.dataBackground = {
			areaStyle: { color: theme['white-bis'], opacity: 1 },
			lineStyle: { color: theme['grey-light'], opacity: 1 },
		}
		dataZoom.borderColor = theme['grey-lighter']
		dataZoom.fillerColor = 'rgba(184,194,204,0.2)'
		dataZoom.textStyle = { color: theme.dark }
		dataZoom.handleStyle = { color: theme['grey-light'] }
	}
	return _.merge(dataZoom, mods) as echarts.DataZoom
}



export function axis(
	opts = {} as Partial<{
		xy: 'x' | 'y'
		blank: boolean
	}>,
	mods = {} as Partial<echarts.Axis>,
) {
	let axis = {
		uuid: nanoid(),
		silent: true,
		gridIndex: 0,
		axisLabel: { textStyle: { color: theme.dark, fontSize: SETTINGS.fontSize } },
		axisLine: { show: !!mods.axisLine },
		axisTick: { show: !!mods.axisTick },
		splitArea: { show: !!mods.splitArea },
		splitLine: { show: !!mods.splitLine },
	} as echarts.Axis
	if (opts.xy == 'x') {
		_.merge(axis, {
			type: 'category',
			axisLabel: { margin: 4, formatter: charts.xlabel },
		} as echarts.Axis)
	}
	if (opts.xy == 'y') {
		_.merge(axis, {
			scale: true,
			type: 'value',
			splitLine: { show: true, lineStyle: { color: theme['grey-lightest'] } },
			axisLabel: { formatter: pretty.number },
		} as echarts.Axis)
	}
	if (opts.blank) {
		_.merge(axis, {
			axisLabel: { show: false },
			axisLine: { show: false },
			axisTick: { show: false },
			splitArea: { show: false },
			splitLine: { show: false },
			axisPointer: { type: 'none', label: { show: false } },
		} as echarts.Axis)
	}
	return _.merge(axis, mods) as echarts.Axis
}



export function series(
	mods = {} as Partial<echarts.Series>,
) {
	let series = {
		uuid: nanoid(),
		silent: true,
		animation: false,
		hoverAnimation: false,
		legendHoverLink: false,
		datasetIndex: 0,
		xAxisIndex: 0,
		yAxisIndex: 0,
		showSymbol: false,
		showAllSymbol: false,
		symbolSize: 4,
		symbolRotate: 0,
		emphasis: null,
		itemStyle: { show: true, width: 4, color: theme['grey-lighter'], opacity: 1 },
	} as echarts.Series
	if (mods.large) {
		series.largeThreshold = SETTINGS.largeThreshold
		series.progressive = SETTINGS.progressiveThreshold
		series.progressiveThreshold = SETTINGS.progressiveThreshold
	}
	return _.merge(series, mods) as echarts.Series
}

export function scatter(
	opts = {} as Partial<{
		width: number
		color: string
		opacity: number
		rotate: number
		outline: boolean
	}>,
	mods = {} as Partial<echarts.Series>,
) {
	let scatter = {
		type: 'scatter',
		symbolSize: opts.width,
		symbolRotate: opts.rotate,
		itemStyle: { color: opts.color, opacity: opts.opacity },
	} as echarts.Series
	if (opts.outline) {
		scatter.itemStyle.borderWidth = 1
		scatter.itemStyle.normal.borderColor = theme.dark
	}
	return _.merge(series(scatter), mods) as echarts.Series
}

export function line(
	opts = {} as Partial<{
		width: number
		color: string
		opacity: number
		step: boolean
		dashed: boolean
		dotted: boolean
		area: number
	}>,
	mods = {} as Partial<echarts.Series>,
) {
	let line = {
		type: 'line',
		itemStyle: { color: opts.color },
		lineStyle: { width: opts.width, color: opts.color, opacity: opts.opacity },
	} as echarts.Series
	if (opts.step) {
		line.step = 'middle'
		line.smooth = false
	}
	if (opts.dashed) line.lineStyle.type = 'dashed';
	if (opts.dotted) line.lineStyle.type = 'dotted';
	if (opts.area) line.areaStyle = { show: true, opacity: opts.area, color: opts.color };
	return _.merge(series(line), mods) as echarts.Series
}

export function bar(
	opts = {} as Partial<{
		width: number
		color: string
		opacity: number
		overlap: boolean
		outline: boolean
	}>,
	mods = {} as Partial<echarts.Series>,
) {
	let bar = {
		type: 'bar',
		large: true,
		barWidth: opts.width,
		itemStyle: { color: opts.color, opacity: opts.opacity },
	} as echarts.Series
	if (opts.overlap) bar.barGap = '-100%';
	if (opts.outline) {
		bar.itemStyle.borderWidth = 1
		bar.itemStyle.borderColor = theme.dark
	}
	return _.merge(series(bar), mods) as echarts.Series
}

export function candlestick(
	mods = {} as Partial<echarts.Series>,
) {
	let candlestick = {
		type: 'candlestick',
		large: true,
		itemStyle: {
			color: theme.success, color0: theme.danger,
			borderColor: theme.success, borderColor0: theme.danger, borderWidth: 1,
		},
	} as echarts.Series
	return _.merge(series(candlestick), mods) as echarts.Series
}



export function markLine(
	mods = {} as Partial<echarts.Mark>,
) {
	let markLine = {
		animation: false,
		silent: true,
		precision: -1,
		symbol: 'none',
		label: {
			backgroundColor: theme.white, borderColor: theme['grey-light'], borderWidth: 1,
			textStyle: { color: theme.dark, fontSize: SETTINGS.fontSize, fontWeight: 'bold', padding: [4, 8] },
		},
		lineStyle: { type: 'dotted', color: theme['grey-light'] },
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


