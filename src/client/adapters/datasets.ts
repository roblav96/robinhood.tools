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
			title: string
			desc: string
			type: string
			primary: boolean
			secondary: boolean
			tipformats: Pretty.NumberFormatOptions[]
			encodes: echarts.Encode[]
			bones(option: echarts.Option, lquotes: Quotes.Live[]): void
			sources(lquotes: Quotes.Live[]): any[][]
			// series(): echarts.Series[]
			// scatter: typeof ecbones.scatter
			// line: typeof ecbones.line
			// bar: typeof ecbones.bar
			// candlestick: typeof ecbones.candlestick
		}
	}
}

export const templates = [

	{
		id: 'pohlc',
		title: 'OHLC',
		primary: true,
		type: 'candlestick',
		tipformats: [{ price: true }],
		encodes: [{
			y: ['open', 'close', 'high', 'low'],
			tooltip: ['open', 'high', 'low', 'close'],
		}],
		series() { return [ecbones.candlestick()] },
	},
	{
		id: 'pline',
		title: 'Price',
		primary: true,
		tipformats: [{ price: true }],
		encodes: [{ y: 'close', tooltip: 'close' }],
	},
	{
		id: 'psize',
		title: 'Size',
		primary: true,
		secondary: true,
		tipformats: { compact: true },
		encodes: [
			{ y: 'sizebull', tooltip: 'value' },
			{ y: 'sizebear', tooltip: 'value' },
		],
		sources(lquotes) {
			return lquotes.map(lquote => {
				let data = {
					sizebull: 0, sizebear: 0,
					timestamp: lquote.timestamp,
				}
				if (lquote.close > lquote.open) {
					data.sizebull = lquote.size
				} else {
					data.sizebear = lquote.size
				}
				return data
			})
		},
		series() {
			return [
				ecbones.bar({ color: theme.success, opacity: 0.5, overlap: true }),
				ecbones.bar({ color: theme.danger, opacity: 0.5, overlap: true }),
			]
		},
	},

	{
		id: 'size',
		title: 'Size',
		desc: 'Size = (total volume) - (previous tick total volume)',
		primary: true,
		secondary: true,
	},

	{
		id: 'volume',
		title: 'Volume',
		desc: 'Volume = total amount of shares traded starting at the first tick',
	},

] as Datasets.Template[]

templates.forEach(v => {
	v.title = v.title || v.name
	v.encodes.forEach(v => v.x = 'timestamp')
})




