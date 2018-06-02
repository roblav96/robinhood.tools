// 

declare namespace ECharts {

	const graphic: any

	interface Dims {
		width: number | string
		height: number | string
	}
	interface InitOptions extends Dims {
		devicePixelRatio: number
		renderer: 'canvas' | 'svg'
	}
	function init(el: HTMLElement, theme?: object, opts?: Partial<InitOptions>): ECharts

	function connect(group: string | string[]): void
	function disConnect(group: string): void
	function dispose(target: ECharts | HTMLElement): void
	function getInstanceByDom(target: HTMLElement): void
	function registerMap(mapName: string, geoJson: object, specialAreas: object): void
	function registerTheme(themeName: string, theme: object): void

	class ECharts {
		_model: { option: ECharts.Options }
		on(eventName: string, handler: (...args: any[]) => void, context?: any): void
		one(eventName: string, handler: (...args: any[]) => void, context?: any): void
		off(eventName: string, handler?: (...args: any[]) => void): void
		resize(dims: Dims): void

		group: string
		setOption(option: Options, notMerge?: boolean, lazyUpdate?: boolean, silent?: boolean): void
		getWidth(): number
		getHeight(): number
		getDom(): HTMLElement
		getOption(): Options
		dispatchAction(payload: any): void
		showLoading(type: string, opts: object): void
		hideLoading(): void
		getDataURL(opts: {
			type: string
			pixelRatio: number
			backgroundColor: string
		}): string
		getConnectedDataURL(opts: {
			type: string
			pixelRatio: number
			backgroundColor: string
		}): string
		clear(): void
		isDisposed(): boolean
		dispose(): void
		convertFromPixel(finder: ConvertFinder, values: number[]): number[]
		convertToPixel(finder: ConvertFinder, values: any[]): any[]
		containPixel(finder: ConvertFinder, values: number[]): boolean
	}

	interface ConvertFinder {
		seriesIndex: number[]
		seriesId: string
		seriesName: string
		geoIndex: number[]
		geoId: string
		geoName: string
		xAxisIndex: number[]
		xAxisId: string
		xAxisName: string
		yAxisIndex: number[]
		yAxisId: string
		yAxisName: string
		gridIndex: number[]
		gridId: string
		gridName: string
	}

	interface Event {
		batch: any[]
		type: string
		start: number
		end: number
	}

	interface DataPoint {
		value: number[]
		name: string
		symbol: string
		symbolSize: number
		symbolRotate: number
		symbolOffset: any[]
		label: Style
		itemStyle: Style
		lineStyle: Style
		areaStyle: Style
	}

	interface Dataset {
		id: string
		source: any[][]
		dimensions: string[]
		sourceHeader: boolean
	}

	interface Options {
		animation: boolean
		animationDuration: number
		animationDurationUpdate: number
		animationEasing: string
		animationEasingUpdate: string
		animationThreshold: number
		axisPointer: AxisPointer
		backgroundColor: string
		brush: any[]
		color: string[]
		dataset: Dataset
		dataZoom: DataZoom[]
		grid: Grid[]
		hoverLayerThreshold: number
		legend: any
		markArea: MarkArea[]
		marker: any[]
		markLine: MarkLine[]
		markPoint: MarkPoint[]
		progressive: number
		progressiveThreshold: number
		series: Series[]
		textStyle: TextStyle
		title: any
		toolbox: any
		tooltip: Tooltip
		useUTC: boolean
		visualMap: any[]
		xAxis: Axis[]
		yAxis: Axis[]
	}

	interface Grid {
		backgroundColor: string
		borderColor: string
		borderWidth: number
		containLabel: boolean
		height: any
		top: any
		bottom: any
		left: any
		right: any
		show: boolean
		width: any
		z: number
		zlevel: number
		tooltip: Tooltip
	}

	interface DataZoom {
		handleStyle: StyleOptions
		textStyle: StyleOptions
		dataBackground: {
			lineStyle: StyleOptions
			areaStyle: StyleOptions
		}
		top: any
		minSpan: number
		maxSpan: number
		bottom: any
		handleIcon: string
		showDetail: boolean
		showDataShadow: boolean
		left: any
		right: any
		height: any
		angleAxisIndex: number[]
		disabled: boolean
		moveOnMouseMove: string
		zoomOnMouseWheel: string
		end: number
		endValue: number
		filterMode: string
		orient: string
		backgroundColor: string
		borderColor: string
		fillerColor: string
		radiusAxisIndex: number[]
		singleAxisIndex: number[]
		start: number
		startValue: number
		throttle: number
		type: string
		realtime: boolean
		xAxisIndex: number[]
		yAxisIndex: number[]
		z: number
		zAxisIndex: number[]
		zlevel: number
		zoomLock: boolean
		// labelFormatter: (y: number, x: number) => string
		labelFormatter: (...params: any[]) => string
	}

	interface Axis {
		data: any[]
		min: number
		max: number
		gridIndex: number
		splitNumber: number
		axisLabel: AxisLabel
		axisLine: AxisLine
		axisPointer: AxisPointer
		axisTick: AxisTick
		boundaryGap: boolean
		inverse: boolean
		name: string
		uuid: string
		nameGap: number
		nameLocation: string
		nameRotate: any
		nameTextStyle: {
			padding: number
			align: string
			verticalAlign: string
			backgroundColor: string
			borderColor: string
			borderRadius: number
			borderWidth: number
			width: number
			height: number
		} & TextStyle & ShadowOpts
		nameTruncate: {
			ellipsis: string
			maxWidth: any
			placeholder: string
		}
		offset: number
		rangeEnd: any
		rangeStart: any
		show: boolean
		scale: boolean
		position: string
		silent: boolean
		splitArea: {
			areaStyle: {
				color: string[]
			}
			show: boolean
		}
		splitLine: {
			lineStyle: StyleOptions
			show: boolean
		}
		tooltip: Tooltip
		triggerEvent: boolean
		type: string
		z: number
		zlevel: number
	}

	interface AxisTick {
		alignWithLabel: boolean
		inside: boolean
		interval: string
		length: number
		lineStyle: StyleOptions
		show: boolean
	}

	interface AxisLine {
		lineStyle: {
			color: string
			type: string
			width: number
		}
		onZero: boolean
		show: boolean
	}

	interface AxisLabel {
		inside: boolean
		interval: number
		margin: number
		formatter: (value: number) => string
		rotate: number
		show: boolean
		showMaxLabel: any
		showMinLabel: any
		lineStyle: StyleOptions
		textStyle: TextStyle
	}

	interface ShadowOpts {
		color: string
		shadowBlur: number
		shadowColor: string
		shadowOffsetX: number
		shadowOffsetY: number
		opacity: number
	}

	interface AxisPointer {
		animation: any
		animationDurationUpdate: number
		handle: {
			color: string
			icon: string
			margin: number
			shadowBlur: number
			shadowColor: string
			shadowOffsetX: number
			shadowOffsetY: number
			show: boolean
			size: number
			throttle: number
		}
		label: {
			backgroundColor: string
			borderColor: any
			borderWidth: number
			// formatter: (params: TooltipPositionParams[], ticket: string, callback: (ticket, result) => string) => string
			formatter: (...params: any[]) => string
			margin: number
			padding: number[]
			precision: string
			shadowBlur: number
			shadowColor: string
			show: boolean
			textStyle: TextStyle
		}
		lineStyle: {
			color: string
			type: string
			width: number
			opacity: number
		}
		link: any
		shadowStyle: ShadowOpts
		show: boolean
		snap: boolean
		status: any
		triggerOn: any
		triggerTooltip: boolean
		type: string
		value: any
		z: number
		zlevel: number
	}

	interface Tooltip {
		formatter: (params: TooltipParams[]) => string
		position: (pos, params, el, elRect, size) => any
		alwaysShowContent: boolean
		axisPointer: AxisPointer
		backgroundColor: string
		borderColor: string
		borderRadius: number
		borderWidth: number
		confine: boolean
		displayMode: string
		enterable: boolean
		extraCssText: string
		hideDelay: number
		padding: number
		show: boolean
		showContent: boolean
		showDelay: number
		textStyle: TextStyle
		transitionDuration: number
		trigger: string
		triggerOn: string
		z: number
		zlevel: number
	}

	interface TooltipPositionParams {
		componentType: string
		componentSubType: string
		seriesType: string
		seriesIndex: number
		seriesId: string
		seriesName: string
		name: string
		dataIndex: number
		data: any[]
		dataType: string
		value: number[]
		color: string
		$vars: string
		axisDim: string
		axisIndex: number
		axisType: string
		axisId: string
		axisValue: number
		axisValueLabel: string
		percent: number
	}

	interface MarkArea {
		animation: boolean
		itemStyle: Style
		label: Style
		tooltip: Tooltip
		data: any[]
		silent: boolean
		z: number
		zlevel: number
	}

	interface MarkLine {
		animation: boolean
		label: Style
		lineStyle: Style
		precision: number
		symbol: string[]
		symbolSize: number
		data: any[]
		silent: boolean
		tooltip: Tooltip
		z: number
		zlevel: number
	}

	interface MarkPoint {
		itemStyle: Style
		label: Style
		symbol: string
		symbolSize: number
		tooltip: Tooltip
		z: number
		zlevel: number
	}

	interface TextStyle {
		color: string
		fontFamily: string
		fontSize: number
		fontStyle: string
		fontWeight: string
	}

	interface StyleOptions {
		borderColor: string
		borderColor0: string
		borderWidth: number
		shadowColor: string
		shadowBlur: number
		shadowOffsetX: number
		shadowOffsetY: number
		color: string
		color0: string
		position: string
		type: string
		width: number
		opacity: number
		show: boolean
		smooth: number
		length: number
		length2: number
		textStyle: StyleOptions
		lineStyle: StyleOptions
	}
	interface Style {
		normal: StyleOptions
		emphasis: StyleOptions
	}

	interface Series {
		connectNulls: boolean
		symbolSize: number
		symbol: string
		symbolRotate: number
		symbolOffset: any[]
		smooth: boolean
		step: string
		smoothMonotone: string
		sampling: string
		silent: boolean
		stack: string
		large: boolean
		largeThreshold: number
		showAllSymbol: boolean
		showSymbol: boolean
		animation: boolean
		tooltip: Tooltip
		data: ECharts.DataPoint[][]
		xAxisIndex: number
		yAxisIndex: number
		animationType: string
		animationDelay: number
		animationDuration: number
		animationEasing: string
		animationUpdate: boolean
		barMaxWidth: any
		barWidth: any
		barGap: any
		barCategoryGap: string
		coordinateSystem: string
		hoverAnimation: boolean
		areaStyle: Style
		lineStyle: Style
		clipOverflow: boolean
		markPoint: MarkPoint
		markLine: MarkLine
		markArea: MarkArea
		itemStyle: Style
		layout: string
		legendHoverLink: boolean
		name: string
		uuid: string
		type: string
		radius: any
		center: any[]
		roseType: string
		label: Style
		labelLine: Style
		id: string
		z: number
		zlevel: number
	}

	interface TooltipParams {
		$vars: string[]
		axisDim: string
		axisId: string
		axisIndex: number
		axisType: string
		axisValue: string
		axisValueLabel: string
		color: string
		componentSubType: string
		componentType: string
		data: number[]
		dataIndex: number
		dataType: any
		marker: string
		name: string
		seriesIndex: number
		seriesType: string
		seriesName: string
		seriesId: string
		value: number
	}

}

declare module 'echarts' {
	export = ECharts
}


