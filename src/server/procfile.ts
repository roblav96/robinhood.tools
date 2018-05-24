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

// ENV.DEBUGGER = false

export default function procfile(pandora: Pandora.ProcfileReconcilerAccessor) {

	Process(pandora.process('api').entry('./api/api'), { SCALE: 2 })

	Process(pandora.process('symbols.service').entry('./services/symbols.service'), { SCALE: 1 })
	Process(pandora.process('search.service').entry('./services/search.service'), { SCALE: 1 })
	Process(pandora.process('hours.service').entry('./services/hours.service'), { SCALE: 1 })
	Process(pandora.process('robinhood.service').entry('./services/robinhood.service'), { SCALE: 1 })

	let SCALE = os.cpus().length
	Process(pandora.process('stocks.service').entry('./services/quotes.service'), { SYMBOLS: 'STOCKS', SCALE })
	Process(pandora.process('forex.service').entry('./services/quotes.service'), { SYMBOLS: 'FOREX', SCALE: 1 })
	Process(pandora.process('indexes.service').entry('./services/quotes.service'), { SYMBOLS: 'INDEXES', SCALE: 1 })





	// Process(pandora.process('benchmark').entry('./benchmarks/api.benchmark'), {
	// 	SCALE: 1,
	// })

	// if (!DEVELOPMENT) {
	// 	pandora.process('dashboard').scale(1)
	// 	pandora.service('dashboard', path.resolve(PROJECT, 'node_modules/pandora-dashboard/dist/Dashboard')).process('dashboard')
	// }

}

let ORDER = 1
function Process(chain: ProcessRepresentationChainModifier, env = {} as Env) {
	_.defaults(env, ENV)
	return (chain
		.nodeArgs(['--no-warnings', '--expose-gc', '--max_old_space_size=2048'])
		.env(env).scale(env.SCALE).order(ORDER++)
	)
}



// import * as fkill from 'fkill'
// process.on('SIGTERM', function(signal) {
// 	console.log('process.on SIGTERM ->', process.pid)
// 	console.log('process.on SIGTERM signal ->', signal)
// 	fkill(process.pid, { force: true, tree: true })
// })
// import * as exithook from 'exit-hook'
// exithook(function() {
// 	console.log('exithook ->', process.pid)
// 	fkill(process.pid, { force: true, tree: true })
// })
// import * as sigexit from 'signal-exit'
// sigexit(function(code, signal) {
// 	console.log('sigexit ->', process.pid)
// 	console.log('sigexit code ->', code)
// 	console.log('sigexit signal ->', signal)
// 	fkill(process.pid, { force: true, tree: true })
// })


