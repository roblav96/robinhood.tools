//

import * as Vts from 'vue-property-decorator'
import { mixins as Mixins } from 'vue-class-component'
import Vue from 'vue'

@Vts.Component
export default class extends Vue {
	clearstorage() {
		localStorage.clear()
		document.location.reload(true)
	}
}
