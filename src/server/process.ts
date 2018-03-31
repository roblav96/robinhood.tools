// 
import '../common/polyfills'
import 'source-map-support/register'
global.WebSocket = require('uws')
// 

import chalk from 'chalk'
import * as eyes from 'eyes'
import * as util from 'util'
import * as _ from 'lodash'
import * as os from 'os'
import * as cluster from 'cluster'
import * as path from 'path'
import * as moment from 'moment'
import * as dotenv from 'dotenv'



global.NODE_ENV = process.env.NODE_ENV || 'development'
global.DEVELOPMENT = NODE_ENV == 'development'
global.PRODUCTION = NODE_ENV == 'production'

process.INSTANCES = os.cpus().length;
process.INSTANCE = cluster.isWorker ? Number.parseInt(process.env.WORKER_INSTANCE) : -1
process.PRIMARY = process.INSTANCE == 0
process.MASTER = cluster.isMaster
process.WORKER = cluster.isWorker

dotenv.config({ path: path.resolve(process.cwd(), 'config/server.' + NODE_ENV + '.env') })
dotenv.config({ path: path.resolve(process.cwd(), 'config/server.env') })
process.NAME = process.env.npm_package_name
process.VERSION = process.env.npm_package_version
process.DOMAIN = (DEVELOPMENT ? 'http://dev.' : 'https://') + process.env.npm_package_domain
process.HOST = process.env.HOST || 'localhost'
process.PORT = Number.parseInt(process.env.PORT) || 12300
process.SERVER = true

process.once('uncaughtException', error => console.error('UNCAUGHT EXCEPTION ->', error))
process.once('unhandledRejection', function(error) {
	console.error('UNHANDLED REJECTION ->', error)
	console.log('https://github.com/mcollina/make-promises-safe')
	process.exit(1)
})



require('debug-trace')()
console.format = function(args) {
	let method = args.method as keyof Console
	let stack = new Error().stack.toString()
	stack = stack.replace(/^ {4}at /gm, '').split('\n')[4].trim()
	let fullpath = stack.split('/').pop()
	if (!fullpath) fullpath = args.filename + ':' + args.getLineNumber();
	let file = fullpath.split(':')[0]
	let i = (fullpath.indexOf(':') == -1) ? 0 : 1
	let line = fullpath.split(':')[i].split(':')[0]
	let cdict = { log: 'blue', info: 'green', warn: 'yellow', error: 'red' } as Dict<string>
	let color = cdict[method] || 'magenta'
	let osquare = chalk[color + 'Bright']('█')
	if (method == 'error') color = color + 'Bright';
	let ofile = '[' + chalk.bold(chalk[color](file) + ':' + line) + ']'
	let oinstance = '[' + chalk.gray(process.INSTANCE) + ']'
	let otime = moment().format('hh:mm:ss:SSS')
	let output = osquare + ofile + oinstance + chalk.gray('T-') + otime
	if (method == 'error') output = chalk.bold.redBright('=============================== ERROR ================================\n') + output;
	return '\n\n' + chalk.underline(output) + '\n'
}

_.merge(util.inspect, {
	defaultOptions: {
		showHidden: true,
		showProxy: true,
		depth: 1,
		colors: true,
		compact: false,
		breakLength: Infinity,
		maxArrayLength: Infinity,
	},
	styles: {
		string: 'green', regexp: 'green', date: 'green',
		number: 'magenta', boolean: 'blue',
		undefined: 'grey', null: 'grey',
		symbol: 'yellow', special: 'cyan',
	},
} as Partial<typeof util.inspect>)

_.merge(eyes.defaults, { styles: { all: 'grey' }, maxLength: 65536, showHidden: true, pretty: true } as eyes.EyesOptions)
const inspector = eyes.inspector(_.defaults({ stream: null } as eyes.EyesOptions, eyes.defaults))
Object.assign(eyes, { stringify(value: any) { return chalk.reset[eyes.defaults.styles.all](inspector(value)) } })



if (DEVELOPMENT) process.INSTANCES = 1;

if (process.MASTER) {

	const workers = {} as Dict<number>
	const fork = function fork(i: number) {
		let worker = cluster.fork({ WORKER_INSTANCE: i })
		workers[worker.process.pid] = i
	}

	console.log('Forking', process.INSTANCES, 'workers in cluster...')
	let i: number, len = process.INSTANCES
	for (i = 0; i < len; i++) { fork(i) }

	// cluster.on('online', function(worker) { console.info('worker', workers[worker.process.pid], 'online') })
	cluster.on('exit', function(worker, code, signal) {
		let i = workers[worker.process.pid]
		console.error('worker', i, 'exit ->', 'id:', worker.id, '| pid:', worker.process.pid, '| code:', code, '| signal:', signal)
		_.delay(fork, 3000, i)
	})

}




