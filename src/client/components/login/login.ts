// 

import * as Vts from 'vue-property-decorator'
import Vue from 'vue'



@Vts.Component({
	name: 'Login',
})
export default class Login extends Vue {

	username = ''
	password = ''
	busy = false
	mfa = ''
	ismfa = false

	get disabled() { return !this.username || !this.password }

	mounted() {
		(this.$refs.username as HTMLElement).focus()
		console.log('process.env', process.env)
	}

	submit() {

	}

}


