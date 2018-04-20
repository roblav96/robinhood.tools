// 

import * as Vts from 'vue-property-decorator'
import { mixins as Mixins } from 'vue-class-component'
import Vue from 'vue'



Vue.component('svg-logo', () => import('@/client/svgs/logo.svg.vue'))

@Vts.Component
export default class extends Vue {

	@Vts.Prop({ default: 'black' })
	fill: string

}


