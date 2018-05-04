// 

import { ServiceRepresentationChainModifier } from 'pandora/dist/application/ServiceRepresentationChainModifier'
import { ProcessRepresentationChainModifier } from 'pandora/dist/application/ProcessRepresentationChainModifier'
import { ProcessContextAccessor } from 'pandora/dist/application/ProcessContextAccessor'
import { ProcfileReconcilerAccessor, DefaultEnvironment, ProcessRepresentation } from 'pandora'
import * as _ from '../common/lodash'
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
	// BENCHMARK: true,
} as ProcEnv
interface ProcEnv extends Partial<NodeJS.ProcessEnv> { [key: string]: any }



function Process(chain: ProcessRepresentationChainModifier, env = {} as ProcEnv) {
	_.defaults(env, PROC_ENV)
	return (chain
		.entry(`./${chain.name()}/${chain.name()}`)
		.nodeArgs(['--no-warnings', '--expose-gc', '--max_old_space_size=2048'])
		.env(env).scale(env.INSTANCES)
	)
}



export default function procfile(pandora: ProcfileReconcilerAccessor) {

	Process(pandora.process('api').order(1), {
		INSTANCES: os.cpus().length,
		// DEBUGGER: false, // !PROC_ENV.BENCHMARK,
	})

	// Process(pandora.process('api').order(1), {
	// 	INSTANCES: os.cpus().length,
	// 	// DEBUGGER: false, // !PROC_ENV.BENCHMARK,
	// })

	// if (PROC_ENV.BENCHMARK) {
	// 	Process(pandora.process('benchmarks').order(2), {
	// 		INSTANCES: 3,
	// 		DEBUGGER: false,
	// 	})
	// }



	if (!PANDORA_DEV) {
		pandora.process('dashboard').scale(1)
		pandora.service('dashboard', path.resolve(PROJECT, 'node_modules/pandora-dashboard/dist/Dashboard')).process('dashboard')
	}

}



// import * as exithook from 'exit-hook'
// exithook(() => process.nextTick(() => process.kill(process.pid, 123)))
// process.on('SIGTERM', () => process.kill(process.pid, 123))
// process.on('SIGTERM', () => process.exit(1))


