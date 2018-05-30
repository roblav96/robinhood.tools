// 

import * as Vts from 'vue-property-decorator'
import { mixins as Mixins } from 'vue-class-component'
import Vue from 'vue'
import VMixin from '@/client/mixins/v.mixin'
import Symbol from './symbol'
import * as core from '@/common/core'



@Vts.Component
export default class extends Mixins(VMixin) {
	$parent: Symbol
	all = this.$parent.all

	created() {
		console.log(`this.all ->`, this.all)
	}

}


