// 

import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import store from '@/client/store'



export const routes = [

	{
		name: 'home', path: '/',
		component: () => import('@/client/routes/home/home'),
	},

	{
		title: 'Portfolio', icon: 'wunderlist',
		name: 'portfolio', path: '/portfolio',
	},

	{
		title: 'Watchlist', icon: 'wunderlist',
		name: 'watchlist', path: '/watchlist',
	},

	{
		title: 'Screener', icon: 'radar',
		name: 'screener', path: '/screener',
	},

	{
		title: 'News', icon: 'newspaper',
		name: 'news', path: '/news',
	},

	{
		name: 'login', path: '/login',
	},

	// {
	// 	title: 'Crypto', icon: 'bitcoin',
	// 	name: 'crypto', path: '/crypto',
	// },

	{
		name: 'symbol', path: '/symbol/:symbol',
		component: () => import('@/client/routes/symbol/symbol'),
	},

	{
		name: 'styleguide', path: '/styleguide',
		component: () => import('@/client/routes/styleguide/styleguide'),
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





declare module 'vue-router/types/router' {
	export interface VueRouter {
		options: RouterOptions
	}
	export interface RouteConfig {
		title: string
		icon: string
	}
}





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


