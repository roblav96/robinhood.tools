// 



export const MICS = {
	ARCX: 'NYSE',
	BATS: 'BATS',
	OTCM: 'OTCM',
	XASE: 'AMEX',
	XNAS: 'NASDAQ',
	XNYS: 'NYSE',
}





declare global {
	namespace Robinhood {

		namespace API {
			interface Paginated<T = any> {
				next: string
				previous: string
				results: T[]
			}
		}

		interface Instrument {
			bloomberg_unique: string
			country: string
			day_trade_ratio: number
			fundamentals: string
			id: string
			list_date: string
			maintenance_ratio: number
			margin_initial_ratio: number
			market: string
			min_tick_size: number
			name: string
			quote: string
			simple_name: string
			splits: string
			state: 'unlisted' | 'active' | 'inactive'
			symbol: string
			tradability: 'untradable' | 'tradable' | 'position_closing_only'
			tradeable: boolean
			type: 'wrt' | 'pfd' | 'stock' | 'etp' | 'unit' | 'adr' | 'nyrs' | 'right' | 'cef' | 'reit' | 'mlp' | 'tracking' | 'lp' | 'rlt'
			url: string
			// 
			acronym: string
			mic: string
			alive: boolean
			// status: 'good' | 'bad'
		}




	}
}


