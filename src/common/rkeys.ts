// 



export { WS } from './socket'
export { HR } from './hours'
export { RH } from './robinhood'
export { WB } from './webull'



export const QUOTES = 'quotes'
export const DEALS = 'deals'

export const SYMBOLS = {
	STOCKS: 'symbols:stocks',
	FOREX: 'symbols:forex',
	INDEXES: 'symbols:indexes',
}
declare global { type SymbolsTypes = keyof typeof SYMBOLS }
export const FSYMBOLS = {
	STOCKS: 'fsymbols:stocks',
	FOREX: 'fsymbols:forex',
	INDEXES: 'fsymbols:indexes',
}

export const SECURITY = {
	DOC: 'security:doc',
}

export const BENCHMARKS = {
	API: {
		PREVIOUS: 'benchmarks:api:previous',
	},
}



// export const ITEMS = 'items'
// export const PRODUCTS = 'products'
// export const QUOTES = 'quotes'


