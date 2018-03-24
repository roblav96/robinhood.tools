// 

import * as Vts from 'vue-property-decorator'
import { mixins as Mixins } from 'vue-class-component'
import Vue from 'vue'



@Vts.Component
export default class extends Vue {

	boxes = [
		{ icon: 'radar', title: 'Bid/Ask Quotes', desc: `Make accurate decisions by knowing exactely what the supply and demand of an asset is.` },
		{ icon: 'backburger', title: 'Trade History', desc: `The real-time transaction records of an asset allows you to see who's buying long and selling short.` },
		{ icon: 'newspaper', title: 'News Feed', desc: `Our bots aggregate news articles 24/7 delivering them to you before they're indexed on search engines.` },
		// { icon: '____', title: '____', desc: `____` },
	]

}


