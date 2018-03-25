// 
import '../common/polyfills'
import 'source-map-support/register'
// 

import chalk from 'chalk'
import * as eyes from 'eyes'
eyes.defaults.maxLength = 65536
eyes.defaults.showHidden = true
import * as _ from 'lodash'
import * as os from 'os'
import * as cluster from 'cluster'
import * as path from 'path'
import * as ee3 from 'eventemitter3'
import * as moment from 'moment'
import * as dotenv from 'dotenv'



global.NODE_ENV = process.env.NODE_ENV
global.DEVELOPMENT = NODE_ENV == 'development'
global.PRODUCTION = NODE_ENV == 'production'

process.INSTANCES = os.cpus().length
process.INSTANCE = cluster.isWorker ? Number.parseInt(process.env.WORKER_INSTANCE) : -1
process.PRIMARY = process.INSTANCE == 0
process.MASTER = cluster.isMaster
process.WORKER = cluster.isWorker

// ████████████████████████████████████████
if (DEVELOPMENT) process.INSTANCES = 0;
// ████████████████████████████████████████

dotenv.config({ path: path.resolve(process.cwd(), 'config/server.' + NODE_ENV + '.env') })
dotenv.config({ path: path.resolve(process.cwd(), 'config/server.env') })
process.NAME = process.env.npm_package_name
process.VERSION = process.env.npm_package_version
process.DOMAIN = (DEVELOPMENT ? 'http://dev.' : 'https://') + process.env.npm_package_domain
process.HOST = process.env.HOST || 'localhost'
process.PORT = (Number.parseInt(process.env.PORT) || 12300) + process.INSTANCE

process.EE3 = new ee3.EventEmitter()



require('debug-trace')()
console.format = function(args) {
	let stack = new Error().stack.toString()
	stack = stack.replace(/^ {4}at /gm, '').split('\n')[4].trim()
	let fullpath = stack.split('/').pop()
	if (!fullpath) fullpath = args.filename + ':' + args.getLineNumber();
	let file = fullpath.split('.ts:')[0]
	let i = (fullpath.indexOf('.ts:') == -1) ? 0 : 1
	let line = fullpath.split('.ts:')[i].split(':')[0]
	let cdict = { log: 'blue', info: 'green', warn: 'yellow', error: 'red' } as Dict<string>
	let color = cdict[args.method] || 'magenta'
	let osquare = chalk[color + 'Bright']('█')
	let ofile = '[' + chalk.bold(chalk[color](file) + ':' + line) + ']'
	let oinstance = '[' + chalk.gray(process.INSTANCE) + ']'
	let otime = moment().format('hh:mm:ss:SSS')
	let output = osquare + ofile + oinstance + chalk.gray('T-') + otime
	if (args.method == 'error') output = chalk.bold.redBright('=============================== ERROR ================================\n') + output;
	return '\n\n' + chalk.underline(output) + '\n'
}



// ████  https://github.com/mcollina/make-promises-safe  ████
process.once('uncaughtException', function(error) {
	console.error(chalk.bold.underline.redBright('UNCAUGHT EXCEPTION') + ' Error ->', error)
	process.exit(1)
})
process.once('unhandledRejection', function(error) {
	console.error(chalk.bold.underline.redBright('UNHANDLED REJECTION') + ' Error ->', error)
	process.exit(1)
})



if (process.MASTER) {

	process.stdout.write('\n\n\n\n' +
		chalk.magentaBright('█') + ' ' + chalk.underline.bold(process.NAME) + '\n' +
		chalk.magentaBright('█') + ' ' + NODE_ENV + ' v' + process.VERSION + '\n' +
		chalk.magentaBright('█') + ' ' + process.HOST + ':' + (process.PORT + 1) + '\n'
	)

	const workers = {} as Dict<number>
	console.log('Forking ' + chalk.bold('x' + chalk.red(process.INSTANCES)) + ' workers in cluster...')
	let i: number, len = process.INSTANCES
	for (i = 0; i < len; i++) {
		let worker = cluster.fork({ WORKER_INSTANCE: i })
		workers[worker.process.pid] = i
	}
	cluster.on('online', function(worker) { console.info('worker', workers[worker.process.pid], 'online') })
	cluster.on('exit', function(worker, code, signal) {
		let i = workers[worker.process.pid]
		console.error('worker', i, 'exit ->', 'id:', worker.id, '| pid:', worker.process.pid, '| code:', code, '| signal:', signal)
		_.delay(function(i: number) {
			let worker = cluster.fork({ WORKER_INSTANCE: i })
			workers[worker.process.pid] = i
		}, 1000, i)
	})

}


