// 

import * as Vts from 'vue-property-decorator'
import { mixins as Mixins } from 'vue-class-component'
import Vue from 'vue'
import VMixin from '@/client/mixins/v.mixin'
import Symbol from './symbol'
import * as core from '@/common/core'
import * as rkeys from '@/common/rkeys'
import * as utils from '@/client/adapters/utils'
import * as http from '@/client/adapters/http'



@Vts.Component
export default class extends Mixins(VMixin) {

	get parent() { return this.$parent as Symbol }



}


