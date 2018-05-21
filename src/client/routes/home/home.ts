// 

import * as Vts from 'vue-property-decorator'
import { mixins as Mixins } from 'vue-class-component'
import Vue from 'vue'
import VMixin from '@/client/mixins/v.mixin'



@Vts.Component
export default class extends Mixins(VMixin) {

	boxes = [{
		icon: 'clock-fast',
		title: 'Real-Time',
		desc: 'Absolutely everything displayed reflects the most recent information.',
	}, {
		icon: 'scale-balance',
		title: 'Bid/Ask Quotes',
		desc: 'Make accurate trades by knowing the supply/demand of an asset.',
	}, {
		icon: 'backburger',
		title: 'Last Sale History',
		desc: 'Transaction feed informs you on who\'s buying long and selling short.',
	}, {
		icon: 'newspaper',
		title: 'News Articles',
		desc: 'Our bots aggregate media 24/7 allowing you to be the first reader.',
		// }, {
		// 	icon: '____',
		// 	title: '____',
		// 	desc: '____',
	}]

}


