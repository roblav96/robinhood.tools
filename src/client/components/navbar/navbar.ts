// 

import * as Vts from 'vue-property-decorator'
import { mixins as Mixins } from 'vue-class-component'
import Vue from 'vue'



@Vts.Component({
	components: {
		'v-searchbar': () => import('@/client/components/searchbar/searchbar'),
	},
})
export default class extends Vue {

	isMobileMenu = false

	created() {
		document.documentElement.classList.add('has-navbar-fixed-top')
	}

	get routes() {
		return this.$router.options.routes.filter(function(route) {
			return route.title && route.icon
		})
	}

}


