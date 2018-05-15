// 



export const RH = {
	SYMBOLS: 'rh:symbols',
	INSTRUMENTS: 'rh:instruments',
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

		namespace Api {

			interface Paginated<T = any> {
				next: string
				previous: string
				results: T[]
			}

			interface Login {
				access_token: string
				backup_code: string
				expires_in: number
				mfa_code: string
				mfa_required: boolean
				mfa_type: string
				refresh_token: string
				scope: string
				token_type: string
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
			alive: boolean
			acronym: string
			mic: string
		}

		namespace Market {
			interface Hours {
				closes_at: string
				extended_opens_at: string
				next_open_hours: string
				previous_open_hours: string
				is_open: boolean
				extended_closes_at: string
				date: string
				opens_at: string
			}
		}
		interface Market {
			website: string
			city: string
			name: string
			url: string
			country: string
			todays_hours: string
			operating_mic: string
			timezone: string
			acronym: string
			mic: string
		}

		interface Account {
			deactivated: boolean
			updated_at: string
			margin_balances: {
				day_trade_buying_power: number
				start_of_day_overnight_buying_power: number
				overnight_buying_power_held_for_orders: number
				cash_held_for_orders: number
				created_at: string
				start_of_day_dtbp: number
				day_trade_buying_power_held_for_orders: number
				overnight_buying_power: number
				marked_pattern_day_trader_date: string
				cash: number
				unallocated_margin_cash: number
				updated_at: string
				cash_available_for_withdrawal: number
				margin_limit: number
				outstanding_interest: number
				uncleared_deposits: number
				unsettled_funds: number
				day_trade_ratio: number
				overnight_ratio: number
			}
			portfolio: string
			cash_balances: string
			withdrawal_halted: boolean
			cash_available_for_withdrawal: number
			type: string
			sma: number
			sweep_enabled: boolean
			deposit_halted: boolean
			buying_power: number
			user: string
			max_ach_early_access_amount: number
			instant_eligibility: {
				updated_at: string
				reason: string
				reinstatement_date: string
				reversal: string
				state: string
			}
			cash_held_for_orders: number
			only_position_closing_trades: boolean
			url: string
			positions: string
			created_at: string
			cash: number
			sma_held_for_orders: number
			account_number: string
			uncleared_deposits: number
			unsettled_funds: number
		}

		interface Portfolio {
			unwithdrawable_grants: number
			account: string
			excess_maintenance_with_uncleared_deposits: number
			url: string
			excess_maintenance: number
			market_value: number
			withdrawable_amount: number
			last_core_market_value: number
			unwithdrawable_deposits: number
			extended_hours_equity: number
			excess_margin: number
			excess_margin_with_uncleared_deposits: number
			equity: number
			last_core_equity: number
			adjusted_equity_previous_close: number
			equity_previous_close: number
			start_date: number
			extended_hours_market_value: number
		}

		interface Position {
			account: string
			intraday_quantity: number
			intraday_average_buy_price: number
			url: string
			created_at: string
			updated_at: string
			shares_held_for_buys: number
			average_buy_price: number
			symbol: string
			instrument: string
			shares_held_for_sells: number
			quantity: number
		}

		interface PortfolioHistorical {
			adjusted_close_equity: number
			begins_at: string
			open_market_value: number
			session: string
			adjusted_open_equity: number
			close_market_value: number
			net_return: number
			open_equity: number
			close_equity: number
		}

		interface News {
			url: string
			title: string
			source: string
			published_at: string
			author: string
			summary: string
			api_source: string
			updated_at: string
			instrument: string
		}

		interface PortfolioHistoricalStats {
			total_return: number
			span: string
			open_time: string
			interval: string
			bounds: string
			adjusted_open_equity: number
			adjusted_previous_close_equity: number
			previous_close_equity: number
			open_equity: number
		}

		interface Application {
			account_type: string
			url: string
			last_error: string
			state: string
			customer_type: string
			cip_questions: any
			user: string
			ready: boolean
		}

		interface User {
			username: string
			first_name: string
			last_name: string
			id_info: string
			url: string
			email_verified: boolean
			created_at: string
			basic_info: string
			email: string
			investment_profile: string
			id: string
			international_info: string
			employment: string
			additional_info: string
		}

	}
}


