// 

import * as Vts from 'vue-property-decorator'
import { mixins as Mixins } from 'vue-class-component'
import Vue from 'vue'
import VSearchBar from '@/client/components/searchbar/searchbar'
import VUtilsMixin from '@/client/mixins/v-utils.mixin'



@Vts.Component({
	components: {
		'v-searchbar': VSearchBar,
	},
})
export default class extends Mixins(VUtilsMixin) {

	showMobileMenu = false

	created() {
		document.documentElement.classList.add('has-navbar-fixed-top')
	}



}


