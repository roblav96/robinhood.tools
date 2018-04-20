// 

import * as Vts from 'vue-property-decorator'
import { mixins as Mixins } from 'vue-class-component'
import Vue from 'vue'



Vue.component('svg-logo', require('@/client/svgs/logo.svg.vue').default)

@Vts.Component
export default class extends Vue {

	@Vts.Prop({ default: 'black' })
	fill: string

}


