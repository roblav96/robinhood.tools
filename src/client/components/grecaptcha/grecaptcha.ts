// 

import * as Vts from 'vue-property-decorator'
import { mixins as Mixins } from 'vue-class-component'
import Vue from 'vue'
import ee3 from 'eventemitter3'
import * as http from '@/client/services/http'



@Vts.Component({
	name: 'Grecaptcha',
})
export default class Grecaptcha extends Vue {

	static emitter = new ee3.EventEmitter<'onload'>()

	@Vts.Prop() gresponse: (success: boolean) => void

	get g_id() { return 'g_recaptcha_' + (this as any)._uid }

	mounted() {
		this.grender()
	}

	beforeDestroy() {
		console.debug('window.grecaptcha')
		console.dir(window.grecaptcha)
	}

	gcallback(response: string) {
		console.warn('g > CALLBACK', response)
		http.post('/recaptcha/verify', { response }).then(response => {
			console.log('response', response)
			this.gresponse(response.success)
		}).catch(error => {
			console.error('gcallback > error', error)
			this.gresponse(false)
		})
	}

	greset() {
		window.grecaptcha.reset((this as any)._uid)
	}

	grender() {
		// if (DEVELOPMENT) return this.gresponse(true);
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
			Grecaptcha.emitter.once('onload', this.grender)
			let script = document.createElement('script')
			script.id = 'recaptcha_script'
			script.setAttribute('src', 'https://www.google.com/recaptcha/api.js?render=explicit&onload=gonload')
			document.body.appendChild(script)
		}
	}

}



window.gonload = () => Grecaptcha.emitter.emit('onload')
declare global { interface Window { grecaptcha: any, gonload: any } }

