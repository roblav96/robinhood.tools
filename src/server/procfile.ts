// 

import { ServiceRepresentationChainModifier } from 'pandora/dist/application/ServiceRepresentationChainModifier'
import { ProcessRepresentationChainModifier } from 'pandora/dist/application/ProcessRepresentationChainModifier'
import { ProcessContextAccessor } from 'pandora/dist/application/ProcessContextAccessor'
import * as Pandora from 'pandora'
import * as _ from '../common/lodash'
import * as os from 'os'
import * as path from 'path'
import * as pkgup from 'pkg-up'



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



// ENV.DEBUGGER = false

export default function procfile(pandora: Pandora.ProcfileReconcilerAccessor) {

	Process(pandora.process('api').entry('./api/api'), {
		SCALE: 2, // os.cpus().length,
	})

	Process(pandora.process('hours.service').entry('./services/hours.service'), { SCALE: 1 })
	Process(pandora.process('robinhood.service').entry('./services/robinhood.service'), { SCALE: 1 })
	Process(pandora.process('symbols.service').entry('./services/symbols.service'), { SCALE: 1 })

	Process(pandora.process('stocks').entry('./services/wb.quotes.service'), {
		SYMBOLS: 'STOCKS',
		SCALE: 1, // os.cpus().length,
	})
	// Process(pandora.process('forex').entry('./services/wb.quotes.service'), {
	// 	SYMBOLS: 'FOREX',
	// 	SCALE: 1,
	// })
	// Process(pandora.process('indexes').entry('./services/wb.quotes.service'), {
	// 	SYMBOLS: 'INDEXES',
	// 	SCALE: 1,
	// })



	// Process(pandora.process('benchmark').entry('./benchmarks/api.benchmark'), {
	// 	SCALE: 1,
	// })



	if (!DEVELOPMENT) {
		pandora.process('dashboard').scale(1)
		pandora.service('dashboard', path.resolve(PROJECT, 'node_modules/pandora-dashboard/dist/Dashboard')).process('dashboard')
	}

}



// import * as exithook from 'exit-hook'
// exithook(function(code) {
// 	console.log('code ->', code)
// 	process.kill(process.pid, 'SIGKILL')
// 	console.log('code ->', code)
// 	// console.log('signal ->', signal)
// })
// exithook(() => process.nextTick(() => process.kill(process.pid, 123)))
// process.on('SIGTERM', () => process.kill(process.pid, 123))
// process.on('SIGTERM', () => process.exit(1))


