// 

import { ServiceRepresentationChainModifier } from 'pandora/dist/application/ServiceRepresentationChainModifier'
import { ProcessRepresentationChainModifier } from 'pandora/dist/application/ProcessRepresentationChainModifier'
import { ProcessContextAccessor } from 'pandora/dist/application/ProcessContextAccessor'
import { ProcfileReconcilerAccessor, DefaultEnvironment, ProcessRepresentation } from 'pandora'
import * as _ from 'lodash'
import * as os from 'os'
import * as path from 'path'
import * as pkgup from 'pkg-up'



const PANDORA_DEV = process.env.PANDORA_DEV == 'true'
const PROJECT = path.dirname(pkgup.sync())
const PACKAGE = require(path.join(PROJECT, 'package.json'))
const PROC_ENV = {
	PROJECT, NAME: PACKAGE.name, VERSION: PACKAGE.version,
	NODE_ENV: PANDORA_DEV ? 'development' : 'production',
	DOMAIN: (PANDORA_DEV ? 'dev.' : '') + PACKAGE.domain,
	INSTANCES: PANDORA_DEV ? 1 : os.cpus().length,
	DEBUGGER: PANDORA_DEV,
	HOST: '127.0.0.1', PORT: 12300,
} as ProcEnv
interface ProcEnv extends Partial<NodeJS.ProcessEnv> { [key: string]: any }



function Process(chain: ProcessRepresentationChainModifier, env = {} as ProcEnv) {
	_.defaults(env, PROC_ENV)
	let pname = chain.name()
	if (pname == 'benchmarks') env.INSTANCES++;
	return chain.nodeArgs(['--no-warnings']).entry(`./${pname}/_${pname}.main`).env(env).scale(env.INSTANCES)
}



export default function procfile(pandora: ProcfileReconcilerAccessor) {

	Process(pandora.process('api').order(1), {
		// INSTANCES: 4,
	})

	// Process(pandora.process('benchmarks').order(2), {
	// 	// INSTANCES: 4,
	// 	DEBUGGER: false,
	// })



	if (!PANDORA_DEV) {
		pandora.process('dashboard').scale(1)
		pandora.service('dashboard', path.resolve(PROJECT, 'node_modules/pandora-dashboard/dist/Dashboard')).process('dashboard')
	}

}


