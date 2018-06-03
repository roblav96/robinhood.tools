// 

import Vue from 'vue'
import Vuex, { Store } from 'vuex'
import store from '../store'
import { colors } from '../styles/tailwind.js'



let state = {} as Colors

function getcolors(event: Event) {
	let el = event.target as HTMLElement
	let style = window.getComputedStyle(document.documentElement)
	let i = 1
	do {
		let color = style.getPropertyValue('--js-' + i)
		if (!color) {
			i = null
		} else {
			let hex = style.getPropertyValue('--' + color.trim())
			Vue.set(state, color.trim(), hex.trim())
			i++
		}
	} while (Number.isFinite(i))
}

if (document.readyState == 'loading') {
	document.addEventListener('DOMContentLoaded', getcolors)
} else {
	getcolors({ target: document.documentElement } as any)
}



store.register('colors', state)
declare global {
	namespace Store { interface State { colors: Colors } }
	interface Colors {
		accent: string
		black: string
		danger: string
		dark: string
		info: string
		light: string
		link: string
		primary: string
		secondary: string
		success: string
		warning: string
		white: string
		rhgreen: string
		rhred: string
	}
	// interface Colors {
	// 	'black': string
	// 	'blue': string
	// 	'blue-dark': string
	// 	'blue-darker': string
	// 	'blue-darkest': string
	// 	'blue-light': string
	// 	'blue-lighter': string
	// 	'blue-lightest': string
	// 	'green': string
	// 	'green-dark': string
	// 	'green-darker': string
	// 	'green-darkest': string
	// 	'green-light': string
	// 	'green-lighter': string
	// 	'green-lightest': string
	// 	'grey': string
	// 	'grey-dark': string
	// 	'grey-darker': string
	// 	'grey-darkest': string
	// 	'grey-light': string
	// 	'grey-lighter': string
	// 	'grey-lightest': string
	// 	'indigo': string
	// 	'indigo-dark': string
	// 	'indigo-darker': string
	// 	'indigo-darkest': string
	// 	'indigo-light': string
	// 	'indigo-lighter': string
	// 	'indigo-lightest': string
	// 	'orange': string
	// 	'orange-dark': string
	// 	'orange-darker': string
	// 	'orange-darkest': string
	// 	'orange-light': string
	// 	'orange-lighter': string
	// 	'orange-lightest': string
	// 	'pink': string
	// 	'pink-dark': string
	// 	'pink-darker': string
	// 	'pink-darkest': string
	// 	'pink-light': string
	// 	'pink-lighter': string
	// 	'pink-lightest': string
	// 	'purple': string
	// 	'purple-dark': string
	// 	'purple-darker': string
	// 	'purple-darkest': string
	// 	'purple-light': string
	// 	'purple-lighter': string
	// 	'purple-lightest': string
	// 	'red': string
	// 	'red-dark': string
	// 	'red-darker': string
	// 	'red-darkest': string
	// 	'red-light': string
	// 	'red-lighter': string
	// 	'red-lightest': string
	// 	'teal': string
	// 	'teal-dark': string
	// 	'teal-darker': string
	// 	'teal-darkest': string
	// 	'teal-light': string
	// 	'teal-lighter': string
	// 	'teal-lightest': string
	// 	'transparent': string
	// 	'white': string
	// 	'yellow': string
	// 	'yellow-dark': string
	// 	'yellow-darker': string
	// 	'yellow-darkest': string
	// 	'yellow-light': string
	// 	'yellow-lighter': string
	// 	'yellow-lightest': string
	// }
}


