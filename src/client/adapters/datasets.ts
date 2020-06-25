//

import * as nanoid from 'nanoid'
import * as echarts from 'echarts'
import * as ecstat from 'echarts-stat'
import * as ti from 'technicalindicators'
import * as ecbones from './ecbones'
import { theme } from '../stores/colors'

declare global {
	namespace Datasets {
		interface Template {
			id: string
			name: string
			desc: string
			primary: boolean
			encodes: Partial<echarts.Encode>[]
			tipformats: Partial<Pretty.NumberFormatOptions>[]
			bones(option: echarts.Option, lquotes: Quotes.Live[]): void
			sources(lquotes: Quotes.Live[]): Dict<number>[][]
		}
	}
}

export const templates: Partial<Datasets.Template>[] = [
	// {
	// 	id: '_ohlc',
	// 	name: 'OHLC',
	// 	primary: true,
	// 	tipformats: [{ price: true }],
	// 	encodes: [{
	// 		y: ['open', 'close', 'high', 'low'],
	// 		tooltip: ['open', 'high', 'low', 'close'],
	// 	}],
	// 	bones: option => [ecbones.candlestick()],
	// },
	// {
	// 	id: '_price',
	// 	name: 'Price',
	// 	primary: true,
	// 	tipformats: [{ price: true }],
	// 	encodes: [{ y: 'close' }],
	// },
	// {
	// 	id: '_size',
	// 	name: 'Size',
	// 	primary: true,
	// 	tipformats: [{ compact: true }],
	// 	encodes: [{ y: ['sizebull', 'sizebear'] }],
	// 	bones: option => [
	// 		ecbones.bar({ color: theme.success, opacity: 0.5, overlap: true }),
	// 		ecbones.bar({ color: theme.danger, opacity: 0.5, overlap: true }),
	// 	],
	// 	sources: lquotes => [lquotes.map(lquote => ({
	// 		sizebull: lquote.close > lquote.open ? lquote.size : 0,
	// 		sizebear: lquote.close <= lquote.open ? lquote.size : 0,
	// 		timestamp: lquote.timestamp,
	// 	}))],
	// },

	{
		id: 'size',
		name: 'Size',
		desc: 'Size = (total volume) - (previous tick total volume)',
		// secondary: true,
	},

	{
		id: 'volume',
		name: 'Volume',
		desc: 'Volume = total amount of shares traded starting at the first tick',
		// secondary: true,
	},
]

templates.forEach((v) => {
	v.encodes.forEach((encode) => {
		encode.x = 'timestamp'
		if (!encode.tooltip) encode.tooltip = encode.y
	})
})
