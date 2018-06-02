// 
// ██████████████████████████████████████████████████████████████████████████████████████████████████████
//       ADOPTED FROM VUETIFY APP BREAKPOINT
//       https://github.com/vuetifyjs/vuetify/blob/dev/src/components/VApp/mixins/app-breakpoint.js
// ██████████████████████████████████████████████████████████████████████████████████████████████████████
// 

import Vuex, { Store } from 'vuex'
import * as _ from '@/common/lodash'
import * as utils from '@/client/adapters/utils'
import store from '@/client/store'



const state = {
	name: '', width: 0, height: 0,
	mobile: false, tablet: false, desktop: false, widescreen: false, fullhd: false,
	tabletOnly: false, tabletAndDown: false, tabletAndUp: false,
	desktopOnly: false, desktopAndDown: false, desktopAndUp: false,
	widescreenOnly: false, widescreenAndDown: false, widescreenAndUp: false,
	mobileOnly: false, fullhdOnly: false,
}

function update() {
	let width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
	let height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)

	let mobile = width < 768
	let tablet = width < 992 && !mobile
	let desktop = width < 1200 && !(tablet || mobile)
	let widescreen = width < 1408 && !(desktop || tablet || mobile)
	let fullhd = width >= 1408 && !(widescreen || desktop || tablet || mobile)

	let name = 'mobile'
	if (tablet) name = 'tablet';
	if (desktop) name = 'desktop';
	if (widescreen) name = 'widescreen';
	if (fullhd) name = 'fullhd';

	let mobileOnly = mobile
	let tabletOnly = tablet
	let tabletAndDown = (mobile || tablet) && !(desktop || widescreen || fullhd)
	let tabletAndUp = !mobile && (tablet || desktop || widescreen || fullhd)
	let desktopOnly = desktop
	let desktopAndDown = (mobile || tablet || desktop) && !(widescreen || fullhd)
	let desktopAndUp = !(mobile || tablet) && (desktop || widescreen || fullhd)
	let widescreenOnly = widescreen
	let widescreenAndDown = (mobile || tablet || desktop || widescreen) && !fullhd
	let widescreenAndUp = !(mobile || tablet || desktop) && (widescreen || fullhd)
	let fullhdOnly = fullhd

	Object.assign(state, {
		name, width, height,
		mobile, tablet, desktop, widescreen, fullhd,
		tabletOnly, tabletAndDown, tabletAndUp,
		desktopOnly, desktopAndDown, desktopAndUp,
		widescreenOnly, widescreenAndDown, widescreenAndUp,
		mobileOnly, fullhdOnly,
	})
	console.log('state ->', JSON.parse(JSON.stringify(state)))

}
update()

const handler = _.debounce(update, 100, { leading: false, trailing: true })
// window.addEventListener('resize', handler, { passive: true })
utils.wemitter.on('resize', handler)
// console.log(`Object.keys(utils.wemitter._events) ->`, Object.keys(utils.wemitter._events))
setTimeout(function() {
	utils.wemitter.offAll('resize')
	// console.log(`Object.keys(utils.wemitter._events) ->`, Object.keys(utils.wemitter._events))
}, 3000)

store.register('breakpoints', state)
declare global { namespace Store { interface State { breakpoints: typeof state } } }


