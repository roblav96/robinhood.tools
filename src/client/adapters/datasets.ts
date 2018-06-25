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
			encode: echarts.Encode
		}
	}
}

export const templates = [

	{
		id: 'size',
		title: 'Size',
		desc: 'Size = (total volume) - (previous tick total volume)',
		key: '',
		encode: { y: 'size', tooltip: 'size' },
	},

	{
		id: 'volume',
		title: 'Volume',
		desc: 'Volume = total amount of shares traded starting at the first tick',
		encode: { y: 'size', tooltip: 'size' },
	},

] as Datasets.Template[]





