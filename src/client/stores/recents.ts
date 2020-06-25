//

import * as lockr from 'lockr'
import * as core from '../../common/core'
import * as http from '../../common/http'
import * as webull from '../../common/webull'
import * as quotes from '../../common/quotes'
import store from '../store'
import router from '../router'

interface Recent {
	symbol: string
	stamp: number
}
const recents = lockr.get('recents', []) as Partial<Recent>[]
store.register('recents', recents)
export default recents
declare global {
	namespace Store {
		interface State {
			recents: typeof recents
		}
	}
}

if (recents.length == 0) {
	http.get('https://securitiesapi.webull.com/api/securities/market/tabs/v2/6/cards/12', {
		query: { pageIndex: 0, pageSize: 20, sourceRegionId: 6 },
	})
		.then((response: Webull.Ticker[]) => {
			response.remove((v) => !core.string.alphaonly(v.disSymbol))
			recents.push(
				...response.map((v) => ({
					symbol: webull.fixSymbol(v.disSymbol),
					stamp: Date.now(),
				})),
			)
		})
		.catch((error) => console.error(`populate Error ->`, error))
}

router.afterEach(function (to, from) {
	let symbol = to.params.symbol
	if (to.name.indexOf('symbol') == 0 && symbol) {
		recents.remove((v) => v.symbol == symbol)
		recents.unshift({ symbol, stamp: Date.now() })
		recents.splice(20)
		lockr.set('recents', recents)
	}
})
