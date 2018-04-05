// 



export const MICS = {
	OTCM: 'OTCM',
	XASE: 'AMEX',
	ARCX: 'NYSE',
	XNYS: 'NYSE',
	XNAS: 'NASDAQ',
	BATS: 'BATS',
}





declare global {
	namespace Robinhood {

		namespace API {
			interface Paginated<T = any> {
				previous: string
				results: T[]
				next: string
			}
		}

		interface Instrument {
			type: 'wrt' | 'pfd' | 'stock' | 'etp' | 'unit' | 'adr' | 'nyrs' | 'right' | 'cef' | 'reit' | 'mlp' | 'tracking' | 'lp' | 'rlt'
			state: 'unlisted' | 'active' | 'inactive'
			tradability: 'untradable' | 'tradable' | 'position_closing_only'
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
			// 
			mic: string
			acronym: string
			alive: boolean
		}




	}
}


