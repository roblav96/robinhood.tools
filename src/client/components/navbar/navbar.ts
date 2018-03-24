// 

import * as Vts from 'vue-property-decorator'
import { mixins as Mixins } from 'vue-class-component'
import Vue from 'vue'
import VUtilsMixin from '@/client/mixins/v-utils.mixin'

// console.log('module.id >', './' + module.id.split('/').pop())

@Vts.Component({
	components: {

	},
})
export default class extends Mixins(VUtilsMixin) {

	showMobileMenu = false

	created() {
		document.documentElement.classList.add('has-navbar-fixed-top')
	}

	mounted() {

	}

	beforeDestroy() {

	}



}


