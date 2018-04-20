// 

import * as Vts from 'vue-property-decorator'
import { mixins as Mixins } from 'vue-class-component'
import Vue from 'vue'
import VUtilsMixin from '@/client/mixins/v-utils.mixin'



@Vts.Component({
	components: {

	},
})
export default class extends Mixins(VUtilsMixin) {

	isMenu = false

	created() {
		document.documentElement.classList.add('has-navbar-fixed-top')
	}

	get routes() {
		return this.$router.options.routes.filter(function(route) {
			return route.navbar
		})
	}

}


