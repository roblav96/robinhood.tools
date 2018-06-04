// 

declare module 'echarts' {
	namespace ECharts {

		type EventNames = 'click' | 'dblclick' | 'mouseover' | 'mouseout' | 'mousemove' | 'mousedown' | 'mouseup' | 'globalout' | 'contextmenu'

		interface EventParam {
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
			event: Event
			marker: string
			name: string
			seriesId: string
			seriesIndex: number
			seriesName: string
			seriesType: string
			type: string
			value: number[]
		}

		interface DataUrlOptions {
			type: string
			pixelRatio: number
			backgroundColor: string
		}

		interface Dims {
			width: number | string
			height: number | string
		}

		interface InitOptions extends Dims {
			devicePixelRatio: number
			renderer: 'canvas' | 'svg'
		}

		const graphic: any
		function init(el: HTMLElement, theme?: object, opts?: Partial<InitOptions>): ECharts
		function connect(group: string | string[]): void
		function disConnect(group: string): void
		function dispose(target: ECharts | HTMLElement): void
		function getInstanceByDom(target: HTMLElement): void
		function registerMap(mapName: string, geoJson: object, specialAreas: object): void
		function registerTheme(themeName: string, theme: object): void

		class ECharts {
			group: string
			_model: { option: Partial<Options> }
			on(eventName: EventNames, handler: (...params: any[]) => void, context?: any): void
			one(eventName: EventNames, handler: (...params: any[]) => void, context?: any): void
			off(eventName: EventNames, handler?: (...params: any[]) => void): void
			resize(dims: Dims): void
			getDataURL(opts: Partial<DataUrlOptions>): string
			getConnectedDataURL(opts: Partial<DataUrlOptions>): string
			setOption(option: Partial<Options>, notMerge?: boolean, lazyUpdate?: boolean, silent?: boolean): void
			getWidth(): number
			getHeight(): number
			getDom(): HTMLElement
			getOption(): Options
			dispatchAction(payload: any): void
			showLoading(type: string, opts: object): void
			hideLoading(): void
			clear(): void
			isDisposed(): boolean
			dispose(): void
			convertFromPixel(finder: Partial<ConvertFinder>, values: number[]): number[]
			convertToPixel(finder: Partial<ConvertFinder>, values: any[]): any[]
			containPixel(finder: Partial<ConvertFinder>, values: number[]): boolean
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

		interface EventData {
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
			label: Partial<Style>
			itemStyle: Partial<Style>
			lineStyle: Partial<Style>
			areaStyle: Partial<Style>
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
			axisPointer: Partial<AxisPointer>
			backgroundColor: string
			brush: any[]
			color: string[]
			dataset: Partial<Dataset>
			dataZoom: Partial<DataZoom> | Partial<DataZoom>[]
			grid: Partial<Grid> | Partial<Grid>[]
			hoverLayerThreshold: number
			legend: any
			markArea: Partial<MarkArea>[]
			marker: any[]
			markLine: Partial<MarkLine>[]
			markPoint: Partial<MarkPoint>[]
			progressive: number
			progressiveThreshold: number
			progressiveChunkMode: string
			series: Partial<Series>[]
			textStyle: Partial<TextStyle>
			title: any
			toolbox: any
			tooltip: Partial<Tooltip>
			useUTC: boolean
			visualMap: any | any[]
			xAxis: Partial<Axis> | Partial<Axis>[]
			yAxis: Partial<Axis> | Partial<Axis>[]
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
			textStyle: Partial<StyleOptions>
			dataBackground: {
				lineStyle: Partial<StyleOptions>
				areaStyle: Partial<StyleOptions>
			}
			top: any
			handleSize: string
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
			show: boolean
			realtime: boolean
			xAxisIndex: number[]
			yAxisIndex: number[]
			z: number
			zAxisIndex: number[]
			zlevel: number
			zoomLock: boolean
			labelFormatter: (...params: any[]) => string
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
			} & Partial<TextStyle> & Partial<ShadowOpts>
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
			formatter: (value: number) => string
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
				formatter: (...params: any[]) => string
				margin: number
				padding: number[]
				precision: string
				shadowBlur: number
				shadowColor: string
				show: boolean
				textStyle: Partial<TextStyle>
			}
			lineStyle: {
				color: string
				type: string
				width: number
				opacity: number
			}
			link: any
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

		interface Tooltip {
			formatter: (...params: any[]) => string
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
			$vars: string
			axisDim: string
			axisId: string
			axisIndex: number
			axisType: string
			axisValue: number
			axisValueLabel: string
			color: string
			componentSubType: string
			componentType: string
			data: any[]
			dataIndex: number
			dataType: string
			name: string
			percent: number
			seriesId: string
			seriesIndex: number
			seriesName: string
			seriesType: string
			value: number[]
		}

		interface MarkArea {
			animation: boolean
			itemStyle: Partial<Style>
			label: Partial<Style>
			tooltip: Partial<Tooltip>
			data: any[]
			silent: boolean
			z: number
			zlevel: number
		}

		interface MarkLine {
			animation: boolean
			label: Partial<Style>
			lineStyle: Partial<Style>
			precision: number
			symbol: string[]
			symbolSize: number
			data: any[]
			silent: boolean
			tooltip: Partial<Tooltip>
			z: number
			zlevel: number
		}

		interface MarkPoint {
			itemStyle: Partial<Style>
			label: Partial<Style>
			symbol: string
			symbolSize: number
			tooltip: Partial<Tooltip>
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
			textStyle: Partial<StyleOptions>
			lineStyle: Partial<StyleOptions>
		}
		interface Style extends Partial<StyleOptions> {
			normal: Partial<StyleOptions>
			emphasis: Partial<StyleOptions>
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
			encode: any
			largeThreshold: number
			progressive: number
			progressiveThreshold: number
			progressiveChunkMode: string
			showAllSymbol: boolean
			showSymbol: boolean
			animation: boolean
			tooltip: Partial<Tooltip>
			data: Partial<DataPoint>[][]
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
			areaStyle: Partial<Style>
			lineStyle: Partial<Style>
			clipOverflow: boolean
			markPoint: Partial<MarkPoint>
			markLine: Partial<MarkLine>
			markArea: Partial<MarkArea>
			itemStyle: Partial<Style>
			layout: string
			legendHoverLink: boolean
			name: string
			uuid: string
			type: string
			radius: any
			center: any[]
			roseType: string
			label: Partial<Style>
			labelLine: Partial<Style>
			id: string
			z: number
			zlevel: number
		}

	}

	export = ECharts

}


