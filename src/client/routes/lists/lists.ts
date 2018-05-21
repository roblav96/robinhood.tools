// 

import * as Vts from 'vue-property-decorator'
import { mixins as Mixins } from 'vue-class-component'
import Vue from 'vue'
import VMixin from '@/client/mixins/v.mixin'



@Vts.Component
export default class extends Mixins(VMixin) {

	get recents() {
		return this.$store.state.recents
	}

}


