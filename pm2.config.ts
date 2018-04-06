// 
global.NODE_ENV = process.env.NODE_ENV || 'development'
global.DEVELOPMENT = NODE_ENV == 'development'
global.PRODUCTION = NODE_ENV == 'production'
// 

console.log('process.env.NODE_ENV ->', process.env.NODE_ENV)

const eyes = require('eyes')
const webpack = require('webpack')
const path = require('path')
const _ = require('lodash')
const dotenv = require('dotenv')
const package = require('./package.json')



const config = {
	apps: [{
		name: 'robinhood.tools',
		script: 'dist/server/main.js',
		exec_mode: 'fork_mode',
		// exec_mode: 'cluster',
		// instances: 8,
		// watch: ['dist'],
		autorestart: false,
		max_memory_restart: '512M',
		vizion: false,
		pmx: false,
		automation: false,
		// max_restarts: 3,
		// min_uptime: '3s',
		args: [
			'--color',
			'--inspect',
		],
		env: {
			'NODE_ENV': 'development'
		},
	}],
}

console.log('config ->', eyes.inspect(config))

module.exports = config


