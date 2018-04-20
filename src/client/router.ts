// 

import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import * as _ from '@/common/lodash'
import store from '@/client/store'



export const routes = [

	{
		name: 'home', path: '/',
		component: () => import('@/client/routes/home/home'),
	},

	{
		name: 'about', path: '/about',
		component: () => import('@/client/routes/about/about'),
	},

	{
		name: 'symbol', path: '/symbol/:symbol',
		component: () => import('@/client/routes/symbol/symbol'),
	},

	{ path: '*', redirect: { name: 'home' } },

] as Array<RouteConfig>



const router = new VueRouter({
	routes, mode: 'history',
	linkExactActiveClass: 'is-active',
	scrollBehavior: function(to, from, saved) {
		if (!from.name || saved) return;
		return { x: 0, y: 0 }
	},
})



export default router



// store.registerModule('routes', {
// 	state: routes.filter(function(route) {
// 		if (route.dev && PRODUCTION) return false;
// 		return !!route.title
// 	}).map(v => _.omit(v, ['component']))
// })

// declare global {
// 	namespace Store {
// 		interface State {
// 			routes: typeof routes
// 		}
// 	}
// }





declare module 'vue-router/types/router' {
	export interface VueRouter {
		options: RouterOptions
	}
	export interface RouteConfig {
		dev: boolean
		title: string
		icon: string
		bold: boolean
	}
}


