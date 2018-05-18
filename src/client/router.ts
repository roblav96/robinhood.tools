// 

import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import * as _ from '@/common/lodash'
import * as core from '@/common/core'
import store from '@/client/store'



export const routes = [

	{
		name: 'home', path: '/',
		component: () => import('@/client/routes/home/home'),
	},

	// {
	// 	title: 'Portfolio', icon: 'chart-pie',
	// 	name: 'portfolio', path: '/portfolio',
	// },

	{
		title: 'Watchlist', icon: 'wunderlist',
		name: 'watchlist', path: '/watchlist',
	},

	{
		title: 'Markets', icon: 'earth',
		name: 'markets', path: '/markets',
	},

	{
		title: 'Screener', icon: 'radar',
		name: 'screener', path: '/screener',
	},

	// {
	// 	title: 'News', icon: 'newspaper',
	// 	name: 'news', path: '/news',
	// },

	{
		name: 'login', path: '/login',
		component: () => import('@/client/routes/login/login'),
	},

	{
		name: 'accounts', path: '/accounts',
		component: () => import('@/client/routes/accounts/accounts'),
	},

	// {
	// 	title: 'Crypto', icon: 'bitcoin',
	// 	name: 'crypto', path: '/crypto',
	// },

	{
		name: 'symbol', path: '/symbol/:symbol',
		component: () => import('@/client/routes/symbol/symbol'),
		// children: [
		// 	{
		// 		name: 'symbol.summary', path: 'summary',
		// 		component: () => import('@/client/routes/symbol/symbol.summary'),
		// 	},
		// 	{
		// 		name: 'symbol', path: '', redirect: { name: 'symbol.summary' }
		// 	},
		// 	{
		// 		path: '*', redirect: { name: 'symbol.summary' }
		// 	},
		// ],
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
		if (to.name == from.name) return;
		if (!from.name || saved) return;
		return { x: 0, y: 0 }
	},
})

router.afterEach(function(to, from) {
	let route = routes.find(v => v.name == to.name)
	document.title = route.title || core.string.capitalize(route.name)
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


