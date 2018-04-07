// 
const NODE_ENV = process.env.NODE_ENV || 'development'
const DEVELOPMENT = NODE_ENV == 'development'
const PRODUCTION = NODE_ENV == 'production'
// 

import * as eyes from 'eyes'
import * as path from 'path'
import * as _ from 'lodash'
import * as dotenv from 'dotenv'



let cwd = process.cwd()
console.log('cwd ->', cwd)

const config = {
	apps: [{
		name: 'robinhood.tools',
		// script: path.join(__dirname, 'main.js'),
		cwd: process.cwd(),
		script: 'dist/server/main.js',
		exec_mode: 'fork_mode',
		// exec_mode: 'cluster',
		// instances: 8,
		// watch: ['dist'],
		// autorestart: false,
		max_memory_restart: '512M',
		vizion: false,
		pmx: false,
		automation: false,
		// max_restarts: 3,
		// min_uptime: '3s',
		// wait_ready: true,
		// kill_timeout: 2000,
		// listen_timeout: 1000,
		args: [
			'--color',
			// '--inspect',
		],
		env: {
			'NODE_ENV': 'development'
		},
	}],
}

console.log('config ->', config)

module.exports = config


