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

	isMobileMenu = false

	created() {
		document.documentElement.classList.add('has-navbar-fixed-top')
	}

	get routes() {
		return this.$router.options.routes.filter(function(route) {
			return route.title && route.icon
		})
	}

	// ondropdown(active: boolean) {
	// 	this.isMenu = active
	// }
	// @Vts.Watch('isMenu') onisMenu(isMenu: boolean) {
	// 	console.log('isMenu ->', isMenu)
	// }
	// disabled = this.$store.state.breakpoint.tabletAndDown
	// @Vts.Watch('$store.state.breakpoint', { deep: true }) onbreakpoint(breakpoint: Breakpoint) {
	// 	this.disabled = breakpoint.tabletAndDown
	// 	console.log('this.disabled ->', this.disabled)
	// }

}


