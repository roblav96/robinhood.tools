// 

import Vue from 'vue'
import Vuex, { Store } from 'vuex'
import * as ibmdesign from 'ibm-design-colors/source/colors'
import * as core from '../../common/core'
import * as utils from '../adapters/utils'
import store from '../store'



export const theme = {} as Colors.Theme
export const ibm = {} as Colors.Ibm
store.register('colors', { theme, ibm })
declare global { namespace Store { interface State { colors: { theme: Colors.Theme, ibm: Colors.Ibm } } } }

ibmdesign.palettes.forEach(color => {
	if (color.name.includes('white') || color.name.includes('gray') || color.name.includes('black')) return;
	ibm[color.name] = `#${color.values.find(v => v.grade == color.core).value}`
})

let themes = ['accent', 'black', 'black-bis', 'black-ter', 'border', 'danger', 'dark', 'grey', 'grey-dark', 'grey-darker', 'grey-light', 'grey-lighter', 'grey-lightest', 'info', 'light', 'link', 'primary', 'secondary', 'success', 'text', 'text-light', 'text-lighter', 'text-strong', 'warning', 'white', 'white-bis', 'white-ter']
function getTheme(event: Event) {
	event.target.removeEventListener('DOMContentLoaded', getTheme)
	let style = window.getComputedStyle(document.documentElement)
	themes.forEach(name => {
		let color = style.getPropertyValue('--' + name)
		Vue.set(theme, name, color.trim())
	})
}
if (document.readyState == 'loading') {
	document.addEventListener('DOMContentLoaded', getTheme)
} else {
	getTheme({ target: document.documentElement } as any)
}



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
			'aqua': string
			'blue': string
			'cerulean': string
			'gold': string
			'green': string
			'indigo': string
			'lime': string
			'magenta': string
			'orange': string
			'peach': string
			'purple': string
			'red': string
			'teal': string
			'ultramarine': string
			'violet': string
			'yellow': string
		}
	}
}


