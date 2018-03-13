// 

import * as Vts from 'vue-property-decorator'
import { mixins as Mixins } from 'vue-class-component'
import Vue from 'vue'



@Vts.Component({
	name: 'Navbar',
})
export default class Navbar extends Vue {
	
	showMenu = false
	showSearch = false
	search = ''
	
	created() {
		document.documentElement.classList.add('has-navbar-fixed-top')
	}

}


