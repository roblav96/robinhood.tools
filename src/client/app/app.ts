//

import * as Vts from 'vue-property-decorator'
import { mixins as Mixins } from 'vue-class-component'
import Vue from 'vue'
import VMixin from '../mixins/v.mixin'
import * as _ from '../../common/lodash'

@Vts.Component({
	components: {
		'v-navbar': () => import('../components/navbar/navbar'),
	},
})
export default class VApp extends Mixins(VMixin) {
	initing = true
	mounted() {
		setTimeout(() => (this.initing = false), 300)
		setTimeout(() => (this.initing = null), 1000)
	}

	get showfooter() {
		return (this.$route.matched[0] || this.$route).meta.nofooter != true
	}
	get routes() {
		return this.$router.options.routes.filter((v) => v.name && !v.path.includes('/:'))
	}

	// hidebackdrop() {
	// 	console.log('hidebackdrop ->')
	// 	// this.$store.state.backdrop = false
	// }
	// @Vts.Watch('$store.state.backdrop') w_backdrop(backdrop: boolean) {
	// 	console.log(`backdrop ->`, backdrop)
	// }
}
