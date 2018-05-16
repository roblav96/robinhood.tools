// 

import * as Vts from 'vue-property-decorator'
import Vue from 'vue'
import socket from '@/client/adapters/socket'
import * as http from '@/client/adapters/http'



@Vts.Component
export default class extends Vue {

	mounted() {
		socket.on('')
	}

}


