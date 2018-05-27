// 

import * as Vts from 'vue-property-decorator'
import Vue from 'vue'
import * as utils from '@/client/adapters/utils'



@Vts.Component({
	template: `
		<span>{{digit}}</span>
	`,
})
class NumberTickerDigit extends Vue {
	@Vts.Prop() direction: string
	@Vts.Prop() digit: string
	@Vts.Watch('digit', { immediate: true }) w_digit(to: string, from: string) {
		if (to == from) return;
	}
}
Vue.component('number-ticker-digit', NumberTickerDigit)

@Vts.Component({
	template: `
		<p><number-ticker-digit v-for="(digit,i) in digits" :key="i" :digit="digit" :direction="direction"></number-ticker-digit></p>
	`,
})
class NumberTicker extends Vue {
	@Vts.Prop() number: number
	@Vts.Watch('number', { immediate: true }) w_number(to: number, from: number) {
		if (!Number.isFinite(to) || to == from) return;
		this.direction = to > from ? 'up' : 'down'
		console.log(`this.direction ->`, this.direction)
		console.log(`to ->`, to)
		console.log(`from ->`, from)
	}
	direction = null as 'up' | 'down'
	get digits() {
		return Number.isFinite(this.number) ? utils.vnumber(this.number).split('') : []
	}
}
Vue.component('number-ticker', NumberTicker)



@Vts.Component({
	template: `
		<figure class="image flex bg-white rounded">
			<img class="is-png self-center rounded" :src="src" v-on:error="onerror">
		</figure>
	`,
})
class SymbolLogo extends Vue {

	@Vts.Prop() symbol: string

	get src() { return 'https://storage.googleapis.com/iex/api/logos/' + this.symbol + '.png' }

	onerror(event: Event) {
		let el = event.target as HTMLImageElement
		let src = 'https://bulma.io/images/placeholders/256x256.png'
		if (el.src == src) return;
		el.src = src
	}

}
Vue.component('symbol-logo', SymbolLogo)


