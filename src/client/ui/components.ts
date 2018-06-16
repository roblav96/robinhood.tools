// 

import * as Vts from 'vue-property-decorator'
import { mixins as Mixins } from 'vue-class-component'
import Vue from 'vue'
import Buefy from 'buefy'
import * as anime from 'animejs'
import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as utils from '../adapters/utils'
import * as pretty from '../adapters/pretty'
import clock from '../../common/clock'



@Vts.Component({
	template: `
		<b-tooltip :label="tip" position="is-right" size="is-small" animated>
			<span>{{fromnow}}</span>
		</b-tooltip>
	`,
})
class VTimestamp extends Vue {
	tip = ''
	fromnow = ''
	@Vts.Prop() value: number
	@Vts.Prop() opts: TimeFormatOptions
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
		this.fromnow = pretty.time(this.value, opts)
		this.tip = pretty.stamp(this.value)
	}
}
Vue.component('v-timestamp', VTimestamp)



@Vts.Component({
	template: `
		<span><span v-digit="digit" v-for="(digit,i) in digits" :key="i">{{digit}}</span></span>
	`,
	directives: {
		digit: {
			update(el, binding, vnode) {
				if (!binding.value || binding.value == binding.oldValue) return;
				let context = vnode.context as VPriceTicker
				anime.remove(el)
				anime({
					targets: el,
					easing: 'easeInQuint',
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
class VPriceTicker extends Vue {
	black: string
	color: string
	colors = this.$store.state.colors
	mounted() { this.black = window.getComputedStyle(this.$el).getPropertyValue('color') }
	@Vts.Prop() price: number
	@Vts.Watch('price') w_number(to: number, from: number) {
		if (!Number.isFinite(to) || !Number.isFinite(from) || to == from) return;
		this.color = to > from ? this.colors.success : this.colors.danger
	}
	get digits() {
		return Number.isFinite(this.price) ? pretty.number(this.price, { price: true }).split('') : []
	}
}
Vue.component('v-price-ticker', VPriceTicker)



@Vts.Component({
	template: `
		<figure class="image flex bg-white rounded">
			<img class="is-png self-center rounded" :src="src" v-on:error="onerror">
		</figure>
	`,
})
class VSymbolLogo extends Vue {
	@Vts.Prop() symbol: string
	get src() { return 'https://storage.googleapis.com/iex/api/logos/' + this.symbol + '.png' }
	onerror(event: Event) {
		let el = event.target as HTMLImageElement
		let src = 'https://bulma.io/images/placeholders/256x256.png'
		if (el.src == src) return;
		el.src = src
	}
}
Vue.component('v-symbol-logo', VSymbolLogo)





// @Vts.Component
// class Loading extends Mixins((Buefy as any).Loading) {
// 	isFullPage: boolean
// 	mounted() {
// 		if (this.isFullPage) return;
// 		let parent = this.$el.parentElement
// 		console.log(`this.$el -> %O`, this.$el, this.$el)
// 		// this.$el.style.left = ''
// 		// this.$el.style.right = ''
// 		// this.$el.style.top = ''
// 		// this.$el.style.bottom = ''
// 		setTimeout(() => {
// 			this.$el.classList.add('block')
// 			this.$el.classList.add('w-full')
// 			this.$el.classList.add('h-full')
// 		}, 1000)
// 	}
// }
// Vue.component('v-loading', Loading)





// @Vts.Component
// class Tooltip extends Mixins((Buefy as any).Tooltip) {
// 	active: boolean
// 	@Vts.Prop({ default: 'is-right' })
// 	position: string
// 	mounted() {
// 		this.$el.addEventListener('pointerenter', this.onenter)
// 	}
// 	beforeDestroy() {
// 		this.$el.removeEventListener('pointerenter', this.onenter)
// 	}
// 	onenter(event: PointerEvent) {
// 		let el = event.target as HTMLElement

// 		// let style = window.getComputedStyle(el, ':after')
// 		// let box = style.getBoundingClientRect()
// 		// console.log('box ->', box)

// 		let n = parseInt(window.getComputedStyle(el, ':before').getPropertyValue('margin-left'), 10)
// 		console.log(`n ->`, n)

// 		// let found = el.offsetParent.querySelector(':after')
// 		// console.log(`found -> %O`, found, found)
// 	}
// }
// Vue.component('v-tooltip', Tooltip)




