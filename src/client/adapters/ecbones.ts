// 

import deepmerge from 'deepmerge'
import * as echarts from 'echarts'
import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import colors from '../stores/colors'



export function blank(mods = {} as Partial<echarts.Option>) {
	return _.merge({
		animation: false,
		color: [colors['grey-lighter']],
		textStyle: { color: colors.dark, fontSize: 14 },
		dataset: [],
		legend: { show: false },
		toolbox: { show: false },
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
			hideDelay: 0,
			transitionDuration: 0,
			// padding: 0,
			padding: [0, 0, 0, 64],
			backgroundColor: 'transparent',
			// formatter: '{a}: {b1}<br>{c}: {d0}',
			// extraCssText: `border: 0.125rem solid ${this.colors['grey-darker']};`,
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
						fontSize: 14, padding: [4, 8], fontWeight: 'bold',
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
	} as echarts.Option, mods)
}

