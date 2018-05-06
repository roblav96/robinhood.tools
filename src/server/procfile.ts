// 

import { ServiceRepresentationChainModifier } from 'pandora/dist/application/ServiceRepresentationChainModifier'
import { ProcessRepresentationChainModifier } from 'pandora/dist/application/ProcessRepresentationChainModifier'
import { ProcessContextAccessor } from 'pandora/dist/application/ProcessContextAccessor'
import { ProcfileReconcilerAccessor, ProcessRepresentation } from 'pandora'
import * as _ from '../common/lodash'
import * as os from 'os'
import * as path from 'path'
import * as pkgup from 'pkg-up'
import * as dotenv from 'dotenv'



const DEVELOPMENT = process.env.PANDORA_DEV == 'true'
const PROJECT = path.dirname(pkgup.sync())
const PACKAGE = require(path.join(PROJECT, 'package.json'))
const ENV = {
	PROJECT, NAME: PACKAGE.name, VERSION: PACKAGE.version,
	NODE_ENV: DEVELOPMENT ? 'development' : 'production',
	DOMAIN: (DEVELOPMENT ? 'dev.' : '') + PACKAGE.domain,
	SCALE: DEVELOPMENT ? 1 : os.cpus().length,
	DEBUGGER: DEVELOPMENT,
	HOST: '127.0.0.1', PORT: 12300,
} as Env
interface Env extends Partial<NodeJS.ProcessEnv> { [key: string]: any }



let order = 1
function Process(chain: ProcessRepresentationChainModifier, env = {} as Env) {
	_.defaults(env, ENV)
	return (chain
		// .entry(`./${chain.name()}/${chain.name()}.main`)
		.nodeArgs(['--no-warnings', '--expose-gc', '--max_old_space_size=2048'])
		.env(env).scale(env.SCALE)
		.order(order++)
	)
}



export default function procfile(pandora: ProcfileReconcilerAccessor) {

	Process(pandora.process('api').entry('./api/api'), {
		// SCALE: os.cpus().length,
		// DEBUGGER: false,
	})

	Process(pandora.process('stocks.watcher').entry('./watchers/stocks.watcher'), {
		// SCALE: os.cpus().length,
		// DEBUGGER: false,
	})

	Process(pandora.process('stocks.service').entry('./services/stocks.service'), {
		SCALE: 1,
		// DEBUGGER: false,
	})

	Process(pandora.process('hours.service').entry('./services/hours.service'), {
		SCALE: 1,
		// DEBUGGER: false,
	})

	// if (ENV.BENCHMARK) {
	// 	Process(pandora.process('benchmarks'), {
	// 		SCALE: 3, DEBUGGER: false,
	// 	})
	// }



	if (!DEVELOPMENT) {
		pandora.process('dashboard').scale(1)
		pandora.service('dashboard', path.resolve(PROJECT, 'node_modules/pandora-dashboard/dist/Dashboard')).process('dashboard')
	}

}



// import * as exithook from 'exit-hook'
// exithook(() => process.nextTick(() => process.kill(process.pid, 123)))
// process.on('SIGTERM', () => process.kill(process.pid, 123))
// process.on('SIGTERM', () => process.exit(1))


