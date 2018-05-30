// 

import * as Vts from 'vue-property-decorator'
import Vue from 'vue'
import * as anime from 'animejs'
import * as _ from '@/common/lodash'
import * as core from '@/common/core'
import * as utils from '@/client/adapters/utils'
import clock from '@/common/clock'





@Vts.Component({ template: `<span>{{fromnow}}</span>` })
class Timestamp extends Vue {
	fromnow = ''
	@Vts.Prop() value: number
	@Vts.Prop() opts: VFromNowOpts
	@Vts.Watch('value') w_value() { this.sync() }
	mounted() {
		this.sync();
		clock.on('1s', this.sync, this)
	}
	beforeDestroy() {
		clock.off('1s', this.sync, this)
	}
	sync() {
		if (!Number.isFinite(this.value)) return this.fromnow = '';
		let opts = this.opts ? core.clone(this.opts) : {}
		this.fromnow = utils.vfromnow(this.value, opts)
	}
}
Vue.component('timestamp', Timestamp)





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
					easing: 'easeInQuint',
					color: [
						{ value: context.color, duration: 0, },
						{ value: context.black, duration: 1000, },
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




