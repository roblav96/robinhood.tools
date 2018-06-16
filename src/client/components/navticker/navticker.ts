// 

import * as Vts from 'vue-property-decorator'
import { mixins as Mixins } from 'vue-class-component'
import Vue from 'vue'
import VMixin from '../../mixins/v.mixin'
import * as core from '../../../common/core'
import * as rkeys from '../../../common/rkeys'
import * as http from '../../../common/http'
import socket from '../../adapters/socket'



@Vts.Component
export default class extends Mixins(VMixin) {

	created() {
		let symbols = ['DJI', 'INX', 'IXIC', 'BTCUSD']
		http.post('/quotes/alls', {
			symbols, types: ['wbticker', 'wbquote'] as Quotes.AllKeys[],
		}).then((response: Quotes.All[]) => {
			console.log(`response ->`, JSON.parse(JSON.stringify(response)))
			this.symbols = symbols
			socket.offListener(this.onwbquote, this)
			response.forEach(v => {
				this.$set(this.wbtickers, v.symbol, v.wbticker)
				this.$set(this.wbquotes, v.symbol, v.wbquote)
				socket.on(`${rkeys.WB.QUOTES}:${v.symbol}`, this.onwbquote, this)
			})
		}).catch(error => console.error(`created Error ->`, error))
	}

	beforeDestroy() {
		socket.offListener(this.onwbquote, this)
		core.nullify(this.wbquotes)
	}

	symbols = [] as string[]
	wbtickers = {} as Dict<Webull.Ticker>
	wbquotes = {} as Dict<Webull.Quote>
	onwbquote(towbquote: Webull.Quote) {
		let wbquote = this.wbquotes[towbquote.symbol]
		wbquote ? core.object.merge(wbquote, towbquote) : this.wbquotes[towbquote.symbol] = towbquote
	}

	vname(name: string) {
		return name.split(' ').slice(0, 3).join(' ')
	}

	onstep(direction: number) {
		let scroll = this.$el.querySelector('.items-center')
		let left = core.math.clamp(scroll.scrollLeft + (direction * 256), 0, scroll.scrollWidth)
		scroll.scrollTo({ left, behavior: 'smooth' })
	}

}


