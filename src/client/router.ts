// 

import Vue from 'vue'
import VueRouter, { RouteConfig, Route } from 'vue-router'
import * as _ from '../common/lodash'
import * as core from '../common/core'
import store from './store'



export const routes = [

	{
		name: 'home', path: '/',
		component: () => import('./routes/home/home'),
	},

	{
		name: 'lists', path: '/lists',
		meta: { icon: 'format-list-bulleted' },
		component: () => import('./routes/lists/lists'),
	},

	{
		name: 'markets', path: '/markets',
		meta: { icon: 'earth' },
	},

	{
		name: 'news', path: '/news',
		meta: { icon: 'newspaper' },
	},

	{
		name: 'screener', path: '/screener',
		meta: { icon: 'radar' },
	},

	{
		name: 'symbol', path: '/symbol/:symbol',
		meta: { nofooter: true, doctitle: false },
		component: () => import('./routes/symbol/symbol'),
		beforeEnter(to, from, next) {
			if (to.params.symbol == to.params.symbol.toUpperCase()) return next();
			next(_.merge(_.clone(to), { params: { symbol: to.params.symbol.toUpperCase() } } as Partial<Route>))
		},
		children: [
			{
				name: 'symbol.summary', path: 'summary',
				meta: { icon: 'bulletin-board' },
				component: () => import('./routes/symbol/symbol.summary'),
			},
			{
				name: 'symbol.chart', path: 'chart',
				meta: { icon: 'chart-line' },
				component: () => import('./routes/symbol/symbol.chart'),
			},
			{
				name: 'symbol.news', path: 'news',
				meta: { icon: 'newspaper' },
				component: () => import('./routes/symbol/symbol.news'),
			},
			{
				name: 'symbol.history', path: 'history',
				meta: { icon: 'calendar-clock' },
				component: () => import('./routes/symbol/symbol.history'),
			},
			{
				name: 'symbol.debug', path: 'debug',
				meta: { icon: 'bug' },
				component: () => import('./routes/symbol/symbol.debug'),
			},
			{ path: '*', redirect: { name: 'symbol' } },
		],
	},

	// {
	// 	name: 'login', path: '/login',
	// 	component: () => import('./routes/login/login'),
	// },
	// {
	// 	name: 'robinhood', path: '/robinhood', meta: {},
	// 	component: () => import('./routes/robinhood/robinhood'),
	// 	children: [
	// 		{
	// 			title: 'Accounts', icon: 'earth',
	// 			name: 'robinhood.accounts', path: 'accounts',
	// 			component: () => import('./routes/robinhood/robinhood.accounts'),
	// 		},
	// 		{
	// 			title: 'Banking', icon: 'bank',
	// 			name: 'robinhood.banking', path: 'banking',
	// 			// component: () => import('./routes/robinhood/robinhood.banking'),
	// 		},
	// 		{
	// 			title: 'Order Book', icon: 'book-open-variant',
	// 			name: 'robinhood.orders', path: 'orders',
	// 			// component: () => import('./routes/robinhood/robinhood.banking'),
	// 		},
	// 	],
	// },

	{
		name: 'styleguide', path: '/styleguide',
		component: () => import('./routes/styleguide/styleguide'),
	},

	{ path: '*', redirect: { name: 'home' } },

] as Array<RouteConfig>



const router = new VueRouter({
	routes, mode: 'history',
	linkActiveClass: '',
	linkExactActiveClass: 'is-active',
	scrollBehavior: function(to, from, saved) {
		to.meta.scroll = saved
		if (!from.name || saved) return;
		return { x: 0, y: 0 }
	},
})

router.afterEach(function(to, from) {
	let route = to.matched[0] || to
	if (route.meta.doctitle != false) {
		document.title = route.meta.title || _.startCase(route.name)
	}
})

export default router





declare module 'vue-router/types/router' {
	export interface VueRouter {
		options: RouterOptions
	}
}
declare global { type VueRouteConfig = RouteConfig }


