// 

import { ProcessContextAccessor } from 'pandora/dist/application/ProcessContextAccessor'
import { ProcfileReconcilerAccessor, DefaultEnvironment } from 'pandora'
import * as _ from 'lodash'
import * as os from 'os'
import * as path from 'path'
import * as pkgup from 'pkg-up'



const CPUS = os.cpus().length
const PROJECT = path.dirname(pkgup.sync())
const PACKAGE = require(path.join(PROJECT, 'package.json'))

module.exports = function(pandora: ProcfileReconcilerAccessor) {

	process.env.NODE_ENV = pandora.dev ? 'development' : 'production'
	const env = {
		NODE_ENV: process.env.NODE_ENV,
		PROJECT: PROJECT,
		NAME: PACKAGE.name,
		VERSION: PACKAGE.version,
		DOMAIN: (process.env.NODE_ENV == 'development' ? 'dev.' : '') + PACKAGE.domain,
		HOST: '127.0.0.1', PORT: 12300,
	} as NodeJS.ProcessEnv



	const api = _.defaults({
		INSTANCES: 4,
		DEBUGGER: true,
	} as NodeJS.ProcessEnv, env)
	pandora.process('api').entry('./api/api.main.js').nodeArgs(['--no-warnings']).env(api).scale(api.INSTANCES)
	// pandora.service('api', './api/api.service.js').process('api').publish(true)

	// const websocket = _.defaults({
	// 	INSTANCES: 4,
	// 	DEBUGGER: true,
	// } as NodeJS.ProcessEnv, env)
	// pandora.process('websocket').env(websocket).scale(websocket.INSTANCES).nodeArgs(['--no-warnings'])
	// pandora.service('websocket', './websocket/websocket.service.js').process('websocket').publish(true)



	if (!pandora.dev) {
		pandora.process('dashboard').scale(1)
		pandora.service('dashboard', path.resolve(PROJECT, 'node_modules/pandora-dashboard/dist/Dashboard')).process('dashboard')
	}

}

import * as clc from 'cli-color'
if (process.env.DEVELOPMENT) setInterval(() => process.stdout.write(clc.erase.lineRight), 1000);


