// 

import * as Vts from 'vue-property-decorator'
import { mixins as Mixins } from 'vue-class-component'
import Vue from 'vue'
import * as _ from '@/common/lodash'
import VUtilsMixin from '@/client/mixins/v-utils.mixin'
import NavBar from '@/client/components/navbar/navbar'



@Vts.Component({
	components: {
		'v-navbar': NavBar,
	},
})
export default class extends Mixins(VUtilsMixin) {
	
	created() {
		
	}

	initing = true
	mounted() {
		_.delay(() => this.initing = false, 100)
		_.delay(() => this.initing = null, 10000)
	}

	get routes() {
		return this.$router.options.routes.filter(v => !!v.name)
	}

}


