// 

import * as Vts from 'vue-property-decorator'
import { mixins as Mixins } from 'vue-class-component'
import Vue from 'vue'
import Navbar from '@/client/components/navbar/navbar'
import * as Login from '@/client/components/login/login'



@Vts.Component({
	name: 'App',
	components: {
		'v-navbar': Navbar,
	},
})
export default class App extends Mixins(Login.Mixin) {

	mounted() {
		// console.log('mounted')
		// setTimeout(() => this.showLogin(), 300)
	}



}


