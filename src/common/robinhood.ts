// 

import ticks from './ticks'





declare global {
	namespace Robinhood {

		namespace API {
			interface Paginated<T = any> {
				previous: string
				results: T[]
				next: string
			}
		}

		namespace Instrument {
			type Types = 'wrt' | 'pfd' | 'stock' | 'etp' | 'unit' | 'adr' | 'nyrs' | 'right' | 'cef' | 'reit' | 'mlp' | 'tracking' | 'lp' | 'rlt'
			type States = 'unlisted' | 'active' | 'inactive'
			type Tradabilities = 'untradable' | 'tradable' | 'position_closing_only'
		}
		interface Instrument {
			type: Instrument.Types
			state: Instrument.States
			tradability: Instrument.Tradabilities
			min_tick_size: number
			splits: string
			margin_initial_ratio: number
			simple_name: string
			url: string
			quote: string
			symbol: string
			bloomberg_unique: string
			list_date: string
			fundamentals: string
			country: string
			day_trade_ratio: number
			tradeable: boolean
			maintenance_ratio: number
			id: string
			market: string
			name: string
			ticker_name: string
			tiny_name: string
			mic: string
			acronym: string
		}




	}
}


