// 
process.env.NODE_ENV = process.env.PANDORA_DEV ? 'development' : 'production'
if (process.env.NODE_ENV == 'development') process.env.DEVELOPMENT = true;
if (process.env.NODE_ENV == 'production') process.env.PRODUCTION = true;
// 

import { ServiceRepresentationChainModifier } from 'pandora/dist/application/ServiceRepresentationChainModifier'
import { ProcessRepresentationChainModifier } from 'pandora/dist/application/ProcessRepresentationChainModifier'
import { ProcessContextAccessor } from 'pandora/dist/application/ProcessContextAccessor'
import { ProcfileReconcilerAccessor, DefaultEnvironment, ProcessRepresentation } from 'pandora'
import * as _ from 'lodash'
import * as os from 'os'
import * as path from 'path'
import * as pkgup from 'pkg-up'



const PROJECT = path.dirname(pkgup.sync())
const PACKAGE = require(path.join(PROJECT, 'package.json'))
const PROC_ENV = {
	NODE_ENV: process.env.NODE_ENV,
	DOMAIN: (process.env.DEVELOPMENT ? 'dev.' : '') + PACKAGE.domain,
	HOST: '127.0.0.1',
	PORT: 12300,
	INSTANCES: 1,
	PROJECT: PROJECT,
	NAME: PACKAGE.name,
	VERSION: PACKAGE.version,
} as ProcEnv

export default function procfile(pandora: ProcfileReconcilerAccessor) {

	let api = Process(pandora
		.process('api')
		.entry('./api/api.main.js')
		.order(1), {
			// INSTANCES: os.cpus().length,
			DEBUGGER: true,
		}
	)

	console.log('api.env() ->', api.env())



	// const api = _.defaults({
	// 	// INSTANCES: os.cpus().length,
	// 	DEBUGGER: true,
	// } as NodeJS.ProcessEnv, env)
	// let idk = pandora.process('api').entry('./api/api.main.js').order(1).nodeArgs(['--no-warnings']).env(api).scale(api.INSTANCES)
	// pandora.service('api', './api/api.service.js').process('api').publish(true)

	// const benchmark = _.defaults({
	// 	DEBUGGER: true,
	// } as NodeJS.ProcessEnv, env)
	// pandora.process('benchmark').entry('./benchmarks/benchmarks.main.js').order(2).nodeArgs(['--no-warnings']).env(benchmark).scale(benchmark.INSTANCES)

	// const websocket = _.defaults({
	// 	INSTANCES: 4,
	// 	DEBUGGER: true,
	// } as NodeJS.ProcessEnv, env)
	// pandora.process('websocket').env(websocket).scale(websocket.INSTANCES).nodeArgs(['--no-warnings'])
	// pandora.service('websocket', './websocket/websocket.service.js').process('websocket').publish(true)



	if (process.env.PRODUCTION) {
		pandora.process('dashboard').scale(1)
		pandora.service('dashboard', path.resolve(PROJECT, 'node_modules/pandora-dashboard/dist/Dashboard')).process('dashboard')
	}

}



interface ProcEnv extends Partial<NodeJS.ProcessEnv> { [key: string]: any }
function Process(chain: ProcessRepresentationChainModifier, env: ProcEnv) {
	_.defaults(env, PROC_ENV)
	return chain.nodeArgs(['--no-warnings']).env(env).scale(env.INSTANCES)
}


