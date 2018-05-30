// 

import * as Vts from 'vue-property-decorator'
import { mixins as Mixins } from 'vue-class-component'
import Vue from 'vue'
import * as core from '@/common/core'
import * as quotes from '@/common/quotes'
import Symbol from './symbol'
import store from '@/client/store'



interface Mixin extends Quotes.All { }
@Vts.Component
class Mixin extends Vue {

	// constructor() {
	// 	super()
	// }

	// created() {
	// 	console.log(`1 this.$store.state.vsymbol ->`, JSON.parse(JSON.stringify(this.$store.state.vsymbol)))
	// 	core.object.merge(this.$data, this.$store.state.vsymbol)
	// 	console.log(`2 this.$store.state.vsymbol ->`, JSON.parse(JSON.stringify(this.$store.state.vsymbol)))
	// }

	// register() {
	// 	store.register('vsymbol', core.array.dict(Object.keys(quotes.ALL_KEYS), {}) as any)
	// 	core.object.merge(this.$data, this.$store.state.vsymbol)
	// }
	// unregister() { store.unregister('vsymbol') }



	// $parent: Symbol
	// symbol = this.$parent.symbol
	// busy = this.$parent.busy
	// quote = this.$parent.quote
	// wbticker = this.$parent.wbticker
	// wbquote = this.$parent.wbquote
	// instrument = this.$parent.instrument
	// yhquote = this.$parent.yhquote
	// iexitem = this.$parent.iexitem
	// deals = this.$parent.deals
}
export default Mixin


