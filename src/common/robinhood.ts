// 



export const RH = {
	RH: 'rh',
	INSTRUMENTS: 'rh:instruments',
	SYMBOLS: 'rh:symbols',
}



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

		namespace Instrument {
			type State = 'unlisted' | 'active' | 'inactive'
			type Tradability = 'untradable' | 'tradable' | 'position_closing_only'
			type Type = 'wrt' | 'pfd' | 'stock' | 'etp' | 'unit' | 'adr' | 'nyrs' | 'right' | 'cef' | 'reit' | 'mlp' | 'tracking' | 'lp' | 'rlt'
			
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
			state: Instrument.State
			symbol: string
			tradability: Instrument.Tradability
			tradeable: boolean
			type: Instrument.Type
			url: string
			// 
			acronym: string
			mic: string
			valid: boolean
		}




	}
}


