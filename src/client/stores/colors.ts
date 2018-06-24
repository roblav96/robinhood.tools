// 

import Vue from 'vue'
import Vuex, { Store } from 'vuex'
import * as ibm from 'ibm-design-colors/source/colors'
import * as core from '../../common/core'
import * as utils from '../adapters/utils'
import store from '../store'



const colors = {
	theme: {} as Colors.Theme,
	ibm: {} as Colors.Ibm,
}
store.register('colors', colors)
export default colors
declare global { namespace Store { interface State { colors: typeof colors } } }

ibm.palettes.forEach(color => {
	if (color.name.includes('white') || color.name.includes('gray') || color.name.includes('black')) return;
	colors.ibm[color.name] = `#${color.values.find(v => v.grade == color.core).value}`
})

let allcolors = ['accent', 'black', 'black-bis', 'black-ter', 'border', 'danger', 'dark', 'grey', 'grey-dark', 'grey-darker', 'grey-light', 'grey-lighter', 'grey-lightest', 'info', 'light', 'link', 'primary', 'secondary', 'success', 'text', 'text-light', 'text-lighter', 'text-strong', 'warning', 'white', 'white-bis', 'white-ter']
function getcolors(event: Event) {
	event.target.removeEventListener('DOMContentLoaded', getcolors)
	let style = window.getComputedStyle(document.documentElement)
	allcolors.forEach(name => {
		let color = style.getPropertyValue('--' + name)
		Vue.set(colors.theme, name, color.trim())
	})
}
if (document.readyState == 'loading') {
	document.addEventListener('DOMContentLoaded', getcolors)
} else {
	getcolors({ target: document.documentElement } as any)
}

console.log(`colors ->`, JSON.parse(JSON.stringify(colors)))



declare global {
	namespace Colors {
		interface Theme {
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
			'text': string
			'text-light': string
			'text-lighter': string
			'text-strong': string
			'warning': string
			'white': string
			'white-bis': string
			'white-ter': string
		}
		interface Ibm {
			'ultramarine': string
			'blue': string
			'cerulean': string
			'aqua': string
			'teal': string
			'green': string
			'lime': string
			'yellow': string
			'gold': string
			'orange': string
			'peach': string
			'red': string
			'magenta': string
			'purple': string
			'violet': string
			'indigo': string
		}
	}
}


