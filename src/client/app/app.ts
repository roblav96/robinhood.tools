// 

import * as Vts from 'vue-property-decorator'
import Vue from 'vue'
import Navbar from '@/client/components/navbar/navbar'



@Vts.Component({
	name: 'App',
	components: {
		'v-navbar': Navbar,
	},
})
export default class App extends Vue {

	created() {
		
	}

	mounted() {

	}

	beforeDestroy() {

	}



}


