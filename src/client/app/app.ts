// 

import * as Vts from 'vue-property-decorator'
import Vue from 'vue'
import Navbar from '@/client/components/navbar/navbar'
import Login from '@/client/components/login/login'



@Vts.Component({
	name: 'App',
	components: {
		'v-login': Login,
		'v-navbar': Navbar,
	},
})
export default class App extends Vue {

	mounted() {
		setTimeout(() => this.showLogin(), 300)
	}



	showLogin() {
		(this as any).$modal.open({
			parent: this,
			component: Login,
			hasModalCard: true
		})
	}



}


