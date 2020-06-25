//

export const RH = {
	IDS: 'rh:ids',
	SYMBOLS: 'rh:symbols',
	INSTRUMENTS: 'rh:instruments',
	SYNC: 'rh:sync',
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
		}

		namespace Instrument {
			type State = 'unlisted' | 'active' | 'inactive'
			type Tradability = 'untradable' | 'tradable' | 'position_closing_only'
			type Type =
				| 'wrt'
				| 'pfd'
				| 'stock'
				| 'etp'
				| 'unit'
				| 'adr'
				| 'nyrs'
				| 'right'
				| 'cef'
				| 'reit'
				| 'mlp'
				| 'tracking'
				| 'lp'
				| 'rlt'
		}
		interface Instrument {
			acronym: string
			alive: boolean
			bloomberg_unique: string
			country: string
			day_trade_ratio: number
			fundamentals: string
			id: string
			list_date: string
			maintenance_ratio: number
			margin_initial_ratio: number
			market: string
			mic: string
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
		}

		interface Market {
			acronym: string
			city: string
			country: string
			mic: string
			name: string
			operating_mic: string
			timezone: string
			todays_hours: string
			url: string
			website: string
		}

		interface Hours {
			closes_at: string
			date: string
			extended_closes_at: string
			extended_opens_at: string
			is_open: boolean
			next_open_hours: string
			opens_at: string
			previous_open_hours: string
		}

		interface Account {
			account_number: string
			buying_power: number
			can_downgrade_to_cash: string
			cash: number
			cash_available_for_withdrawal: number
			cash_balances: string
			cash_held_for_orders: number
			created_at: number
			deactivated: boolean
			deposit_halted: boolean
			instant_eligibility: Account.InstantEligibility
			margin_balances: Account.MarginBalances
			max_ach_early_access_amount: number
			only_position_closing_trades: boolean
			option_level: string
			portfolio: string
			positions: string
			sma: number
			sma_held_for_orders: number
			sweep_enabled: boolean
			type: string
			uncleared_deposits: number
			unsettled_debit: number
			unsettled_funds: number
			updated_at: number
			url: string
			user: string
			withdrawal_halted: boolean
		}
		namespace Account {
			interface InstantEligibility {
				reason: string
				reinstatement_date: string
				reversal: string
				state: string
				updated_at: number
			}
			interface MarginBalances {
				cash: number
				cash_available_for_withdrawal: number
				cash_held_for_options_collateral: number
				cash_held_for_orders: number
				created_at: number
				day_trade_buying_power: number
				day_trade_buying_power_held_for_orders: number
				day_trade_ratio: number
				gold_equity_requirement: number
				margin_limit: number
				marked_pattern_day_trader_date: string
				outstanding_interest: number
				overnight_buying_power: number
				overnight_buying_power_held_for_orders: number
				overnight_ratio: number
				sma: number
				start_of_day_dtbp: number
				start_of_day_overnight_buying_power: number
				unallocated_margin_cash: number
				uncleared_deposits: number
				unsettled_debit: number
				unsettled_funds: number
				updated_at: number
			}
		}

		interface Portfolio {
			account: string
			adjusted_equity_previous_close: number
			equity: number
			equity_previous_close: number
			excess_maintenance: number
			excess_maintenance_with_uncleared_deposits: number
			excess_margin: number
			excess_margin_with_uncleared_deposits: number
			extended_hours_equity: number
			extended_hours_market_value: number
			last_core_equity: number
			last_core_market_value: number
			market_value: number
			start_date: number
			unwithdrawable_deposits: number
			unwithdrawable_grants: number
			url: string
			withdrawable_amount: number
		}

		interface Position {
			account: string
			average_buy_price: number
			created_at: number
			instrument: string
			intraday_average_buy_price: number
			intraday_quantity: number
			pending_average_buy_price: number
			quantity: number
			shares_held_for_buys: number
			shares_held_for_options_collateral: number
			shares_held_for_options_events: number
			shares_held_for_sells: number
			shares_held_for_stock_grants: number
			shares_pending_from_options_events: number
			symbol: string
			updated_at: number
			url: string
		}

		interface PortfolioHistorical {
			adjusted_close_equity: number
			adjusted_open_equity: number
			begins_at: string
			close_equity: number
			close_market_value: number
			net_return: number
			open_equity: number
			open_market_value: number
			session: string
		}

		interface News {
			api_source: string
			author: string
			instrument: string
			published_at: string
			source: string
			summary: string
			title: string
			updated_at: number
			url: string
		}

		interface PortfolioHistoricalStats {
			adjusted_open_equity: number
			adjusted_previous_close_equity: number
			bounds: string
			interval: string
			open_equity: number
			open_time: string
			previous_close_equity: number
			span: string
			total_return: number
		}

		interface Application {
			account_type: string
			cip_questions: any
			customer_type: string
			last_error: string
			ready: boolean
			state: string
			url: string
			user: string
		}

		interface User {
			additional_info: string
			basic_info: string
			created_at: number
			email: string
			email_verified: boolean
			employment: string
			first_name: string
			id: string
			id_info: string
			international_info: string
			investment_profile: string
			last_name: string
			url: string
			username: string
		}

		interface Oauth {
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

		interface Order {
			account: string
			average_price: number
			cancel: any
			created_at: number
			cumulative_quantity: number
			executions: Order.Execution[]
			extended_hours: boolean
			fees: number
			id: string
			instrument: string
			last_transaction_at: string
			override_day_trade_checks: boolean
			override_dtbp_checks: boolean
			position: string
			price: any
			quantity: number
			ref_id: string
			reject_reason: any
			response_category: any
			side: string
			state: string
			stop_price: any
			time_in_force: string
			trigger: string
			type: string
			updated_at: number
			url: string
		}
		namespace Order {
			interface Execution {
				id: string
				price: number
				quantity: number
				settlement_date: string
				timestamp: number
			}
		}

		interface Subscription {
			account: string
			created_at: number
			credit: number
			ended_at: string
			id: string
			plan: Subscription.Plan
			renewal_date: any
			unsubscribe: any
			url: string
		}
		namespace Subscription {
			interface Plan {
				id: string
				instant_deposit_limit: string
				margin_interest: any
				monthly_cost: string
				subscription_margin_limit: string
			}
		}

		interface WatchlistMeta {
			created_at: number
			currency_pair_ids: string[]
			id: string
			name: string
			updated_at: number
			url: string
			user: string
		}
		interface Watchlist {
			created_at: number
			instrument: string
			symbol: string
			url: string
			watchlist: string
		}

		interface AchTransfer {
			ach_relationship: string
			amount: number
			cancel: any
			created_at: number
			direction: string
			early_access_amount: number
			expected_landing_date: string
			fees: number
			id: string
			scheduled: boolean
			state: string
			updated_at: number
			url: string
		}

		interface AchRelationship {
			account: string
			bank_account_holder_name: string
			bank_account_nickname: string
			bank_account_number: number
			bank_account_type: string
			bank_routing_number: number
			created_at: number
			id: string
			initial_deposit: number
			unlink: string
			unlinked_at: any
			url: string
			verification_method: string
			verified: boolean
			verify_micro_deposits: any
			withdrawal_limit: number
		}
	}
}
