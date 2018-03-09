// 

import * as Vts from 'vue-property-decorator'
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


