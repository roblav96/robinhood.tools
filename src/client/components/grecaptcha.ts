// 

import * as Vts from 'vue-property-decorator'
import Vue from 'vue'
import Emitter from '../../common/emitter'
import * as alert from '../adapters/alert'
import * as http from '../adapters/http'



const emitter = new Emitter<'onload'>()
window.gonload = () => emitter.emit('onload')
declare global { interface Window { grecaptcha: any, gonload: any } }

@Vts.Component({
	template: `<div :id="gid" class="g-recaptcha"></div>`,
})
export default class extends Vue {

	get gid() { return 'g_recaptcha_' + this._uid }

	mounted() {
		this.grender()
	}

	gcallback(gresponse: string) {
		http.post('/recaptcha/verify', { gresponse }).then((response: Security.Doc) => {
			Object.assign(this.$store.state.security, response)
			alert.toast('Captcha challenge complete!')
		}).catch(error => console.error('gcallback > error', error))
	}

	greset() {
		window.grecaptcha.reset(this._uid)
	}

	grender() {
		// if (process.env.DEVELOPMENT) return this.gsuccess(true);
		if (!!document.getElementById('recaptcha_script')) {
			window.grecaptcha.render(this.$el, {
				sitekey: process.env.RECAPTCHA_SITE,
				theme: 'light',
				size: 'normal',
				'callback': this.gcallback,
				'expired-callback': this.greset,
				'error-callback': this.greset,
			})
		} else {
			emitter.once('onload', this.grender)
			let script = document.createElement('script')
			script.id = 'recaptcha_script'
			script.setAttribute('src', 'https://www.google.com/recaptcha/api.js?render=explicit&onload=gonload')
			document.body.appendChild(script)
		}
	}

}


