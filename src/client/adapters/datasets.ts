// 

import * as nanoid from 'nanoid'
import * as echarts from 'echarts'
import * as ecstat from 'echarts-stat'
import * as ti from 'technicalindicators'



declare global {
	namespace Datasets {
		interface Template {
			id: string
			title: string
			desc: string
			bones(option: echarts.Option, lquotes: Quotes.Live[]): void
			data(option: echarts.Option, lquotes: Quotes.Live[]): void
		}
	}
}

export const templates = [

	{
		id: 'size',
		title: 'Size',
		desc: 'Size = (total volume) - (previous tick total volume)',
		primary: true,
		secondary: true,
		bones(option, lquotes) {

		},
	},

	{
		id: 'volume',
		title: 'Volume',
		desc: 'Volume = total amount of shares traded starting at the first tick',
	},

] as Datasets.Template[]





