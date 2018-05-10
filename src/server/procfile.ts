// 

import { ServiceRepresentationChainModifier } from 'pandora/dist/application/ServiceRepresentationChainModifier'
import { ProcessRepresentationChainModifier } from 'pandora/dist/application/ProcessRepresentationChainModifier'
import { ProcessContextAccessor } from 'pandora/dist/application/ProcessContextAccessor'
import * as Pandora from 'pandora'
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



let ORDER = 1
function Process(chain: ProcessRepresentationChainModifier, env = {} as Env) {
	_.defaults(env, ENV)
	return (chain
		.nodeArgs(['--no-warnings', '--expose-gc', '--max_old_space_size=2048'])
		.env(env).scale(env.SCALE).order(ORDER++)
	)
}



export default function procfile(pandora: Pandora.ProcfileReconcilerAccessor) {

	Process(pandora.process('api').entry('./api/api'), {
		SCALE: 2, // os.cpus().length,
	})

	Process(pandora.process('symbols').entry('./watchers/symbols.watcher'), {
		SCALE: 1
	})
	// Process(pandora.process('stocks').entry('./watchers/quotes.watcher'), {
	// 	SYMBOLS: 'STOCKS',
	// 	SCALE: 2, // os.cpus().length,
	// })
	Process(pandora.process('forex').entry('./watchers/quotes.watcher'), {
		SYMBOLS: 'FOREX',
		SCALE: 1,
	})
	// Process(pandora.process('indexes').entry('./watchers/quotes.watcher'), {
	// 	SYMBOLS: 'INDEXES',
	// 	SCALE: 1,
	// })

	Process(pandora.process('hours.service').entry('./services/hours.service'), {
		SCALE: 1,
	})



	// Process(pandora.process('services'), {

	// })
	// pandora.service('hours.service', './services/hours.service').process('services').publish(true)
	// pandora.service('stocks.service', './services/stocks.service').process('services').publish(true)

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
// exithook(function(code) {
// 	console.log('code ->', code)
// 	// console.log('signal ->', signal)
// 	// process.kill(process.pid, code || signal)
// })
// exithook(() => process.nextTick(() => process.kill(process.pid, 123)))
// process.on('SIGTERM', () => process.kill(process.pid, 123))
// process.on('SIGTERM', () => process.exit(1))


