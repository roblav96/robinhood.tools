// 

import * as Vts from 'vue-property-decorator'
import { mixins as Mixins } from 'vue-class-component'
import Vue from 'vue'
import VMixin from '@/client/mixins/v.mixin'
import * as _ from '@/common/lodash'



@Vts.Component({
	components: {
		'v-navbar': () => import('@/client/components/navbar/navbar'),
	},
})
export default class extends Mixins(VMixin) {

	created() {

	}

	initing = true
	mounted() {
		setTimeout(() => this.initing = false, 300)
		setTimeout(() => this.initing = null, 1000)
	}

	get routes() {
		return this.$router.options.routes.filter(v => v.name && !v.path.includes('/:'))
	}

}


