// 

import * as Vts from 'vue-property-decorator'
import Vue from 'vue'



@Vts.Component({
	template: `
		<figure class="image flex bg-white rounded">
			<img class="is-png self-center rounded" :src="src" v-on:error="onerror"></img>
		</figure>
	`,
})
class SymbolLogo extends Vue {

	@Vts.Prop() symbol: string

	get src() { return 'https://storage.googleapis.com/iex/api/logos/' + this.symbol + '.png' }

	onerror(event: Event) {
		let el = event.target as HTMLImageElement
		el.src = 'https://bulma.io/images/placeholders/256x256.png'
	}

}
Vue.component('ui-symbol-logo', SymbolLogo)


