// 

import * as Vts from 'vue-property-decorator'
import { mixins as Mixins } from 'vue-class-component'
import Vue from 'vue'
import VMixin from '@/client/mixins/v.mixin'
import * as http from '@/client/adapters/http'



@Vts.Component
export default class extends Mixins(VMixin) {

	get recents() { return this.$store.state.recents }
	recentsfn() { return this.recents.map(v => v.symbol) }
	
	starsfn(){
		return http.get('')
	}

	lists = [{
		name: 'Recent Symbols',
		symbols: () => { this.recents.map(v => v.symbol) },
	}]
	wbquotes = [] as Webull.Quote[]

	syncquotes() {
		return http.post('/symbols', { symbols }).then(response => {

		})
	}

}


