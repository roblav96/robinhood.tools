// 

import * as Vts from 'vue-property-decorator'
import Vue from 'vue'
import * as anime from 'animejs'
import * as utils from '@/client/adapters/utils'
import * as benchmark from '@/common/benchmark'



@Vts.Component({
	template: `
		<p><span v-digit="digit" v-for="(digit,i) in digits" :key="i">{{digit}}</span></p>
	`,
	directives: {
		digit: {
			update(el, binding, vnode) {
				if (!binding.value || binding.value == binding.oldValue) return;
				let context = vnode.context as NumberTicker
				anime.remove(el)
				anime({
					targets: el,
					easing: 'easeInQuart',
					color: [
						{ value: context.color, duration: 0, },
						{ value: context.black, duration: 500, },
					],
				})
			},
			unbind(el) { anime.remove(el) },
		},
	},
})
class NumberTicker extends Vue {
	black: string
	color: string
	mounted() { this.black = window.getComputedStyle(this.$el).getPropertyValue('color') }
	@Vts.Prop() number: number
	@Vts.Watch('number') w_number(to: number, from: number) {
		if (!Number.isFinite(to) || !Number.isFinite(from) || to == from) return;
		this.color = to > from ? this.colors.success : this.colors.danger
	}
	get colors() { return this.$store.state.colors }
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


