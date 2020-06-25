//

declare namespace EChartsStat {
	type InputData = number[][]
	type OutputData = number[][]

	interface HistogramBins {
		bins: HistogramBinsBin[]
		data: OutputData
	}
	interface HistogramBinsBin {
		x0: number
		y0: number
		sample: number[]
	}
	function histogram(
		data: number[],
		binMethod: 'squareRoot' | 'scott' | 'freedmanDiaconis' | 'sturges',
	): HistogramBins

	namespace clustering {
		interface Result {
			centroids: OutputData
			clusterAssment: OutputData
			pointsInCluster: OutputData
		}
		function hierarchicalKMeans(
			data: InputData,
			clusterNumer: number,
			stepByStep: boolean,
		): Result
		function kMeans(data: InputData, clusterNumer: number): Result
	}

	interface RegressionResult<T = number[]> {
		points: OutputData
		parameter: T
		expression: string
		gradient: number
		intercept: number
	}
	function regression(
		regreMethod: 'exponential' | 'logarithmic' | 'polynomial',
		data: InputData,
		order?: number,
	): RegressionResult

	interface LinearRegressionResult {
		gradient: number
		intercept: number
	}
	function regression(
		regreMethod: 'linear',
		data: InputData,
		order?: number,
	): RegressionResult<LinearRegressionResult>

	namespace statistics {
		function deviation(data: number[]): number
		function sampleVariance(data: number[]): number
		function quantile(data: number[], p: number): number
		function max(data: number[]): number
		function mean(data: number[]): number
		function median(data: number[]): number
		function min(data: number[]): number
		function sum(data: number[]): number
	}
}

declare module 'echarts-stat' {
	export = EChartsStat
}
