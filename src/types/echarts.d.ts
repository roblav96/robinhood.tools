// 

declare module 'echarts' {
	namespace ECharts {

		type EventNames =
			'axisareaselected' |
			'brush' |
			'brushselected' |
			'click' |
			'contextmenu' |
			'datarangeselected' |
			'dataviewchanged' |
			'datazoom' |
			'dblclick' |
			'finished' |
			'focusnodeadjacency' |
			'globalout' |
			'hidetip' |
			'legendscroll' |
			'legendselectchanged' |
			'legendselected' |
			'legendunselected' |
			'magictypechanged' |
			'mapselectchanged' |
			'mapselected' |
			'mapunselected' |
			'mousedown' |
			'mousemove' |
			'mouseout' |
			'mouseover' |
			'mouseup' |
			'pieselectchanged' |
			'pieselected' |
			'pieunselected' |
			'rendered' |
			'restore' |
			'showtip' |
			'timelinechanged' |
			'timelineplaychanged' |
			'unfocusnodeadjacency' |
			'updateaxispointer'

		interface EventParam<T = any> {
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
			data: T
			dataIndex: number
			dataType: any
			event: Event
			marker: string
			name: number | string
			seriesId: string
			seriesIndex: number
			seriesName: string
			seriesType: string
			type: string
			value: T
		}

		interface DataUrlOptions {
			type: string
			pixelRatio: number
			backgroundColor: string
		}

		interface Dims {
			width: number // | string
			height: number // | string
		}

		interface InitOptions extends Dims {
			devicePixelRatio: number
			renderer: 'canvas' | 'svg'
		}

		interface OptionOptions {
			notMerge: boolean
			lazyUpdate: boolean
			silent: boolean
		}

		const graphic: any
		function init(el: HTMLElement | Node, theme?: string | object, opts?: Partial<InitOptions>): ECharts
		function connect(group: string | string[]): void
		function disConnect(group: string): void
		function dispose(target: ECharts | HTMLElement | Node): void
		function getInstanceByDom(target: HTMLElement | Node): void
		function registerMap(mapName: string, geoJson: object, specialAreas: object): void
		function registerTheme(themeName: string, theme: object): void

		class ECharts {
			id: string
			group: string
			_model: { option: Option }
			_$handlers: { [event: string]: any }
			constructor(el: HTMLElement | Node, theme?: string | object, opts?: Partial<InitOptions>)
			on(eventName: EventNames, handler: (...params: any[]) => void, context?: any): void
			one(eventName: EventNames, handler: (...params: any[]) => void, context?: any): void
			off(eventName: EventNames, handler?: (...params: any[]) => void, context?: any): void
			resize(dims: Dims): void
			getDataURL(opts: Partial<DataUrlOptions>): string
			getConnectedDataURL(opts: Partial<DataUrlOptions>): string
			setOption(option: Partial<Option>, opts?: Partial<OptionOptions>): void
			getWidth(): number
			getHeight(): number
			getDom(): HTMLElement
			getOption(): Option
			// 
			getModel(): any
			getViewOfComponentModel(componentModel: any): any
			getViewOfSeriesModel(seriesModel: any): any
			getVisual(finder: any, visualType: any): any
			// 
			dispatchAction(payload: any): void
			showLoading(type: string, opts: object): void
			hideLoading(): void
			clear(): void
			isDisposed(): boolean
			dispose(): void
			convertFromPixel(finder: Partial<ConvertFinder>, values: number[]): number[]
			convertToPixel(finder: Partial<ConvertFinder>, values: any[]): any[]
			containPixel(finder: Partial<ConvertFinder>, values: number[]): boolean
			trigger(name: string): void
		}

		interface ConvertFinder {
			seriesIndex: string | number[]
			seriesId: string
			seriesName: string
			geoIndex: string | number[]
			geoId: string
			geoName: string
			xAxisIndex: string | number[]
			xAxisId: string
			xAxisName: string
			yAxisIndex: string | number[]
			yAxisId: string
			yAxisName: string
			gridIndex: string | number[]
			gridId: string
			gridName: string
		}

		interface EventData {
			batch: any[]
			manual: boolean
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
			label: Partial<Style>
			itemStyle: Partial<Style>
			lineStyle: Partial<Style>
			areaStyle: Partial<Style>
		}

		interface Dimension {
			name: string
			type: string
			displayName: string
		}
		interface Dataset {
			id: string
			source: any[]
			// source: any[] | any[][] | { [key: string]: any[] }
			dimensions: string[] | Dimension[]
			sourceHeader: boolean
		}

		interface Option {
			animation: boolean
			animationDuration: number
			animationDurationUpdate: number
			animationEasing: string
			animationEasingUpdate: string
			animationThreshold: number
			axisPointer: Partial<AxisPointer>[]
			backgroundColor: string
			brush: any[]
			color: string[]
			dataset: Partial<Dataset>[]
			dataZoom: Partial<DataZoom>[]
			grid: Partial<Grid>[]
			hoverLayerThreshold: number
			legend: any
			marker: any[]
			progressive: number
			progressiveThreshold: number
			progressiveChunkMode: string
			series: Partial<Series>[]
			textStyle: Partial<TextStyle>
			title: any
			toolbox: any
			tooltip: Partial<Tooltip>[]
			useUTC: boolean
			visualMap: Partial<VisualMap>[]
			xAxis: Partial<Axis>[]
			yAxis: Partial<Axis>[]
		}

		interface VisualMapRange {
			color: string[]
			colorAlpha: string[]
			colorHue: string[]
			colorLightness: string[]
			colorSaturation: string[]
			opacity: number[]
			symbol: string[]
			symbolSize: number[]
		}
		interface VisualMapController {
			inRange: VisualMapRange
			outOfRange: VisualMapRange
		}
		interface VisualMapPiece {

		}
		interface VisualMap {
			align: string
			backgroundColor: string
			borderColor: string
			borderWidth: number
			bottom: number | string
			calculable: boolean
			categories: string[]
			color: string
			contentColor: string
			controller: VisualMapController
			dimension: string
			formatter: string | ((value: number) => string)
			height: number | string
			hoverLink: boolean
			id: string
			inactiveColor: string
			inRange: VisualMapRange
			inverse: boolean
			itemGap: number
			itemHeight: number
			itemSymbol: string
			itemWidth: number
			left: number | string
			max: number
			maxOpen: boolean
			min: number
			minOpen: boolean
			orient: string
			outOfRange: VisualMapRange
			padding: number | string | (number | string)[]
			pieces: any[]
			precision: number
			range: number[]
			realtime: boolean
			right: number | string
			selected: boolean[]
			selectedMode: string
			seriesIndex: number | number[]
			show: boolean
			showLabel: boolean
			splitNumber: number
			target: VisualMapController
			text: string[]
			textGap: number
			textStyle: TextStyle
			top: number | string
			type: 'continuous' | 'piecewise'
			width: number | string
			z: number
			zlevel: number
		}

		interface Grid {
			backgroundColor: string
			borderColor: string
			borderWidth: number
			containLabel: boolean
			height: number | string
			top: number | string
			bottom: number | string
			left: number | string
			right: number | string
			show: boolean
			width: number | string
			z: number
			zlevel: number
			tooltip: Tooltip
		}

		interface DataZoom {
			handleStyle: Partial<StyleOptions>
			textStyle: Partial<TextStyle>
			dataBackground: {
				lineStyle: Partial<StyleOptions>
				areaStyle: Partial<StyleOptions>
			}
			top: number | string
			handleSize: string
			minSpan: number
			maxSpan: number
			minValueSpan: number | string | Date
			maxValueSpan: number | string | Date
			bottom: number | string
			handleIcon: string
			showDetail: boolean
			showDataShadow: boolean
			left: number | string
			right: number | string
			height: number | string
			angleAxisIndex: number[]
			disabled: boolean
			preventDefaultMouseMove: boolean
			moveOnMouseMove: boolean | string
			zoomOnMouseWheel: boolean | string
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
			show: boolean
			realtime: boolean
			rangeMode: string[]
			xAxisIndex: number[]
			yAxisIndex: number[]
			z: number
			zAxisIndex: number[]
			zlevel: number
			zoomLock: boolean
			labelFormatter: (...params: number[]) => string
		}

		interface Axis {
			data: any[]
			min: number | string
			max: number | string
			gridIndex: number
			splitNumber: number
			axisLabel: Partial<AxisLabel>
			axisLine: Partial<AxisLine>
			axisPointer: Partial<AxisPointer>
			axisTick: Partial<AxisTick>
			boundaryGap: boolean | number | string | (number | string)[]
			inverse: boolean
			name: string
			uuid: string
			nameGap: number
			nameLocation: string
			nameRotate: any
			nameTextStyle: Partial<Style> & Partial<TextStyle> & Partial<ShadowOpts>
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
			logBase: number
			position: string
			silent: boolean
			splitArea: {
				areaStyle: {
					color: string[]
				}
				show: boolean
			}
			splitLine: {
				lineStyle: Partial<StyleOptions>
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
			lineStyle: Partial<StyleOptions>
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
			formatter: (value: number, index?: number) => string
			rotate: number
			show: boolean
			showMaxLabel: any
			showMinLabel: any
			lineStyle: Partial<StyleOptions>
			textStyle: Partial<TextStyle>
		}

		interface ShadowOpts {
			color: string
			shadowBlur: number
			shadowColor: string
			shadowOffsetX: number
			shadowOffsetY: number
			opacity: number
		}

		interface AxisPointerParams<T = any> {
			seriesData: EventParam<T>[]
			value: number
		}
		interface AxisPointerStyle {
			color: string
			type: string
			width: number
			opacity: number
		}
		interface AxisPointerHandle {
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
		interface AxisPointerLabel {
			backgroundColor: string
			borderColor: any
			borderWidth: number
			formatter: (params: AxisPointerParams) => string
			margin: number
			padding: number[]
			precision: string
			shadowBlur: number
			shadowColor: string
			show: boolean
			textStyle: Partial<TextStyle>
		}
		interface AxisPointer {
			animation: any
			animationDurationUpdate: number
			handle: Partial<AxisPointerHandle>
			label: Partial<AxisPointerLabel>
			lineStyle: AxisPointerStyle
			crossStyle: AxisPointerStyle
			link: any[]
			shadowStyle: Partial<ShadowOpts>
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

		interface PositionSize {
			contentSize: number[]
			viewSize: number[]
		}
		interface Tooltip {
			formatter: string | ((params: EventParam | EventParam[], ticket?: number, callback?: (ticket: number, tooltip: string) => void) => string)
			position: number | string | (number | string)[] | ((point: number[], params: EventParam[], el: HTMLElement, rect: any, size: PositionSize) => (number | string)[])
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
			padding: number | string | (number | string)[]
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

		interface MarkData {
			coord: number[]
			label: Partial<Style>
			lineStyle: Partial<StyleOptions>
			name: string
			symbol: string | string[]
			symbolSize: number | number[]
			type: string
			value: number
			valueDim: string
			valueIndex: number
			x: number
			xAxis: number
			y: number
			yAxis: number
		}
		interface Mark {
			animation: boolean
			data: Partial<MarkData>[]
			itemStyle: Partial<Style>
			label: Partial<Style>
			lineStyle: Partial<StyleOptions>
			precision: number
			silent: boolean
			symbol: string | string[]
			symbolSize: number | number[]
			tooltip: Partial<Tooltip>
			z: number
			zlevel: number
		}

		interface TextStyle extends Dims {
			fontFamily: string
			fontSize: number
			fontStyle: string
			fontWeight: number | string
			lineHeight: number
			backgroundColor: string | ((param: EventParam) => string)
			borderColor0: string | ((param: EventParam) => string)
			borderColor: string | ((param: EventParam) => string)
			borderWidth: number
			borderRadius: number
			padding: number | string | (number | string)[]
			color0: string | ((param: EventParam) => string)
			color: string | ((param: EventParam) => string)
		}

		interface StyleOptions {
			align: string
			backgroundColor: string | ((param: EventParam) => string)
			borderColor0: string | ((param: EventParam) => string)
			borderColor: string | ((param: EventParam) => string)
			borderRadius: number
			borderWidth: number
			color0: string | ((param: EventParam) => string)
			color: string | ((param: EventParam) => string)
			emphasis: Partial<StyleOptions>
			formatter: string | ((param: EventParam) => string)
			height: number
			itemStyle: Partial<StyleOptions>
			label: Partial<StyleOptions>
			length2: number
			length: number
			lineStyle: Partial<StyleOptions>
			opacity: number
			padding: number
			position: string
			shadowBlur: number
			shadowColor: string
			shadowOffsetX: number
			shadowOffsetY: number
			show: boolean
			smooth: number
			textStyle: Partial<TextStyle>
			type: string
			verticalAlign: string
			width: number
		}
		interface Style extends Partial<StyleOptions> {
			normal: Partial<StyleOptions>
			emphasis: Partial<StyleOptions>
		}

		interface Encode {
			angle: string | string[]
			itemId: string | string[]
			itemName: string | string[]
			lat: string | string[]
			lng: string | string[]
			radius: string | string[]
			seriesName: string | string[]
			tooltip: string | string[]
			value: string | string[]
			x: string | string[]
			y: string | string[]
		}
		interface Series {
			animation: boolean
			animationDelay: number
			animationDuration: number
			animationEasing: string
			animationType: string
			animationUpdate: boolean
			areaStyle: Partial<Style>
			barCategoryGap: string
			barGap: any
			barMaxWidth: any
			barWidth: any
			center: any[]
			clipOverflow: boolean
			connectNulls: boolean
			coordinateSystem: string
			data: Partial<DataPoint>[][]
			datasetIndex: number
			dimensions: string[] | Dimension[]
			emphasis: Partial<StyleOptions>
			encode: Partial<Encode>
			hoverAnimation: boolean
			id: string
			itemStyle: Partial<Style>
			label: Partial<Style>
			labelLine: Partial<Style>
			large: boolean
			largeThreshold: number
			layout: string
			legendHoverLink: boolean
			lineStyle: Partial<Style>
			markArea: Partial<Mark>
			markLine: Partial<Mark>
			markPoint: Partial<Mark>
			name: string
			progressive: number
			progressiveChunkMode: string
			progressiveThreshold: number
			radius: any
			roseType: string
			sampling: string
			seriesLayoutBy: string
			showAllSymbol: boolean
			showSymbol: boolean
			silent: boolean
			smooth: boolean | number
			smoothMonotone: string
			stack: string
			step: string
			symbol: string
			symbolOffset: any[]
			symbolRotate: number
			symbolSize: number
			tooltip: Partial<Tooltip>
			type: string
			uuid: string
			xAxisIndex: number
			yAxisIndex: number
			z: number
			zlevel: number
		}

	}

	export = ECharts

}


