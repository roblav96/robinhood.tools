// 

import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import _ from 'lodash'



export const routes = [

	{
		name: 'home', path: '/',
		component: () => import('@/client/routes/home/home'),
	},

	{
		name: 'storybook', path: '/storybook',
		component: () => import('@/client/routes/storybook/storybook'),
	},

	{ path: '*', redirect: { name: 'home' } },

] as Array<RouteConfig>



const router = new VueRouter({
	routes, mode: 'history',
	linkExactActiveClass: 'is-active',
	// linkActiveClass: 'is-active',
})

router.afterEach(function(to, from) {
	_.delay(window.scrollTo, !from.name ? 100 : 1, { top: 0, behavior: 'instant' })
})

export default router





declare module 'vue-router/types/router' {
	export interface RouteConfig {
		dname?: string
		icon?: string
		bold?: boolean
	}
}


