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

	{
		title: 'Watchlist', icon: 'wunderlist',
		name: 'watchlist', path: '/watchlist',
	},

	{
		title: 'Markets', icon: 'earth',
		name: 'markets', path: '/markets',
	},

	{
		title: 'News', icon: 'newspaper',
		name: 'news', path: '/news',
	},

	{
		title: 'Screener', icon: 'radar',
		name: 'screener', path: '/screener',
	},

	// {
	// 	title: 'Explore', icon: 'compass',
	// 	name: 'explore', path: '/explore',
	// },

	{
		name: 'login', path: '/login',
		component: () => import('@/client/routes/login/login'),
	},

	{
		name: 'accounts', path: '/accounts',
		component: () => import('@/client/routes/accounts/accounts'),
	},

	{
		name: 'robinhood', path: '/robinhood',
		component: () => import('@/client/routes/robinhood/robinhood'),
		children: [
			{
				title: 'Accounts', icon: 'earth',
				name: 'robinhood.accounts', path: 'accounts',
				component: () => import('@/client/routes/robinhood/robinhood.accounts'),
			},
			{
				title: 'Banking', icon: 'bank',
				name: 'robinhood.banking', path: 'banking',
				// component: () => import('@/client/routes/robinhood/robinhood.banking'),
			},
			// {
			// 	name: 'symbol', path: '', redirect: { name: 'robinhood.index' }
			// },
			// {
			// 	path: '*', redirect: { name: 'robinhood.index' }
			// },
		],
	},

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

	// {
	// 	title: 'Portfolio', icon: 'chart-pie',
	// 	name: 'portfolio', path: '/portfolio',
	// },

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
	document.title = route ? route.title || core.string.capitalize(route.name) : core.string.capitalize(to.name)
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


