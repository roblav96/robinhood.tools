// 

import * as Vts from 'vue-property-decorator'
import { mixins as Mixins } from 'vue-class-component'
import Vue from 'vue'
import VMixin from '@/client/mixins/v.mixin'
import RHMixin from '@/client/mixins/robinhood.mixin'
import * as _ from '@/common/lodash'
import * as pretty from '@/common/pretty'
import * as utils from '@/client/adapters/utils'
import dayjs from '@/common/dayjs'
import clock from '@/common/clock'



@Vts.Component({
	components: {
		'v-searchbar': () => import('@/client/components/searchbar/searchbar'),
	},
})
export default class extends Mixins(VMixin, RHMixin) {

	created() {
		this.$router.afterEach(() => this.showmenu = false)
		document.documentElement.classList.add('has-navbar-fixed-top')
		clock.on('1s', this.onsec)
		this.onsec()
	}
	beforeDestroy() {
		clock.offListener(this.onsec)
		document.removeEventListener('pointerdown', this.onpointer)
	}

	showmenu = false
	@Vts.Watch('showmenu') w_showmenu(to: boolean) {
		document.removeEventListener('pointerdown', this.onpointer)
		if (to == true) document.addEventListener('pointerdown', this.onpointer);
	}
	onpointer(event: MouseEvent) {
		let path = (event as any).path as HTMLElement[]
		if (!path.find(v => v.id == 'navbar')) this.showmenu = false;
	}
	@Vts.Watch('breakpoints.name') w_breakpointsname(to: string) {
		if (this.showmenu && this.breakpoints.desktopAndUp) this.showmenu = false;
	}

	time = ''
	onsec() { this.time = dayjs().format('h:mm:ssa') }
	get state() { return utils.marketState(this.$store.state.hours.state) }
	get scolor() {
		let state = this.$store.state.hours.state
		if (!state) return 'has-text-grey';
		if (state == 'REGULAR') return 'has-text-success';
		if (state.includes('PRE') || state.includes('POST')) return 'has-text-warning';
		return 'has-text-grey'
	}

	isroute(name: string) { return name == this.$route.name }

	// get routes() {
	// let routes = [] as VueRouteConfig[]
	// this.$router.options.routes.forEach(function(route) {
	// 	if (Array.isArray(route.children)) {
	// 		if (route.name == 'robinhood') {
	// 			routes.push(route.children.find(v => v.name == 'robinhood.orders'))
	// 		}
	// 	}
	// 	if (route.title && route.icon) routes.push(route);
	// })
	// // routes.push({ title: 'Order Book', icon: 'book-open-variant', name: 'robinhood.orders' } as VueRouteConfig)
	// return routes
	// }

}


