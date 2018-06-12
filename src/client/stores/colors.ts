// 

import Vue from 'vue'
import Vuex, { Store } from 'vuex'
import * as core from '../../common/core'
import * as utils from '../adapters/utils'
import store from '../store'



const colors = {} as Colors
store.register('colors', colors)
export default colors
declare global { namespace Store { interface State { colors: Colors } } }

let theme = ['accent', 'black', 'black-bis', 'black-ter', 'border', 'danger', 'dark', 'grey', 'grey-dark', 'grey-darker', 'grey-light', 'grey-lighter', 'grey-lightest', 'info', 'light', 'link', 'primary', 'secondary', 'success', 'text', 'text-strong', 'warning', 'white', 'white-bis', 'white-ter']
function getcolors(event: Event) {
	event.target.removeEventListener('DOMContentLoaded', getcolors)
	let style = window.getComputedStyle(document.documentElement)
	theme.forEach(name => {
		let color = style.getPropertyValue('--' + name)
		Vue.set(colors, name, color.trim())
	})
}

if (document.readyState == 'loading') {
	document.addEventListener('DOMContentLoaded', getcolors)
} else {
	getcolors({ target: document.documentElement } as any)
}



declare global {
	interface Colors {
		'accent': string
		'black': string
		'black-bis': string
		'black-ter': string
		'border': string
		'danger': string
		'dark': string
		'grey': string
		'grey-dark': string
		'grey-darker': string
		'grey-light': string
		'grey-lighter': string
		'grey-lightest': string
		'info': string
		'light': string
		'link': string
		'primary': string
		'secondary': string
		'success': string
		'warning': string
		'white': string
		'white-bis': string
		'white-ter': string
	}
}


