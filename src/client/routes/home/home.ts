// 

import * as Vts from 'vue-property-decorator'
import { mixins as Mixins } from 'vue-class-component'
import Vue from 'vue'



@Vts.Component
export default class extends Vue {

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
		title: 'News Feed',
		desc: 'Our bots aggregate articles 24/7 allowing you to be the first reader.',
		// }, {
		// 	icon: '____',
		// 	title: '____',
		// 	desc: '____',
	}]

}


