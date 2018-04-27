// 

import * as Vts from 'vue-property-decorator'
import { mixins as Mixins } from 'vue-class-component'
import Vue from 'vue'



@Vts.Component
export default class extends Vue {

	@Vts.Prop() symbol: string

	get src() { return 'https://storage.googleapis.com/iex/api/logos/' + this.symbol + '.png' }

	onerror(event: Event) {
		let el = event.target as HTMLImageElement
		el.src = 'https://bulma.io/images/placeholders/256x256.png'
		// 'https://logo.clearbit.com/www.nasdaq.com'
	}

}


