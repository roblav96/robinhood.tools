// 

import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import store from '@/client/services/store'
import App from '@/client/app/app'



export const routes = [

	{
		name: 'home', path: '/', component: () => import('@/client/routes/home/home'),
	},

	{
		path: '*', redirect: { name: 'home' },
	},

] as Array<RouteConfig>

export const router = new VueRouter({
	mode: 'history', routes,
})

export const app = new App({ router, store }).$mount('#app')

