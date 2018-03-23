// 

import * as Vts from 'vue-property-decorator'
import { mixins as Mixins } from 'vue-class-component'
import Vue from 'vue'
import _ from 'lodash'
import NavBar from '@/client/components/navbar/navbar'



@Vts.Component({
	components: {
		'v-navbar': NavBar,
	},
})
export default class extends Vue {

	initing = true
	mounted() {
		_.delay(() => this.initing = false, 1)
		_.delay(() => delete this.initing, 300)
	}

}


