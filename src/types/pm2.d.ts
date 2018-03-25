// 

import * as _pm2 from 'pm2'



declare module 'pm2' {
	export interface Proc {
		script: string
		pmx: boolean
		automation: boolean
		max_restarts: number
		min_uptime: string
		max_memory_restart: string
		env: { [key: string]: string | number }
	}
	export interface Ecosystem {
		apps: _pm2.Proc[]
	}
}


