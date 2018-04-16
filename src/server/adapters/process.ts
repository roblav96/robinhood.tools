// 

process.DIRNAME = __dirname.split('/').slice(0, -3).join('/')
declare global { namespace NodeJS { export interface Process { DIRNAME: string } } }



import * as path from 'path'
const pkg = require(path.resolve(process.DIRNAME, 'package.json'))
process.NAME = pkg.name
process.VERSION = pkg.version
process.DOMAIN = (DEVELOPMENT ? 'dev.' : '') + pkg.domain
process.SERVER = true



import * as os from 'os'
if (PRODUCTION || !Number.isFinite(process.INSTANCES)) process.INSTANCES = os.cpus().length;
process.INSTANCES = Math.max(process.INSTANCES, 1)
process.INSTANCE = process.env.NODE_APP_INSTANCE ? Number.parseInt(process.env.NODE_APP_INSTANCE) : 0
process.PRIMARY = process.INSTANCE == 0
declare global { namespace NodeJS { export interface ProcessEnv { NODE_APP_INSTANCE: string } export interface Process { PRIMARY: boolean } } }



import * as cluster from 'cluster'
process.MASTER = cluster.isMaster
process.WORKER = cluster.isWorker
declare global { namespace NodeJS { export interface Process { MASTER: boolean, WORKER: boolean } } }



import * as dotenv from 'dotenv'
dotenv.config({ path: path.resolve(process.DIRNAME, 'config/server.' + NODE_ENV + '.env') })
dotenv.config({ path: path.resolve(process.DIRNAME, 'config/server.env') })
process.HOST = process.env.HOST || '127.0.0.1'
process.PORT = Number.parseInt(process.env.PORT) || 12300
declare global { namespace NodeJS { export interface Process { HOST: string, PORT: number } } }



function exiting(signal: NodeJS.Signals) {
	if (!signal || signal.constructor != String) signal = 'SIGKILL';
	eexit.emit('onexit')
	setImmediate(process.kill, process.pid, signal)
}
process.once('exit' as any, exiting);
process.once('SIGINT', exiting)
process.once('SIGTERM', exiting)
process.once('SIGUSR2', exiting)

import * as EventEmitter3 from 'eventemitter3'
let eexit = new EventEmitter3<'onexit'>()
process.onexit = function onexit(fn) { eexit.once('onexit', fn) }
declare global { namespace NodeJS { export interface Process { onexit: (fn: () => any) => any } } }



import chalk from 'chalk'
import * as clc from 'cli-color'
if (process.PRIMARY) {
	if (DEVELOPMENT) setInterval(() => process.stdout.write(clc.erase.lineRight), 1000);
	process.stdout.write(
		`\n\n\n` +
		`${chalk.magentaBright('█')} ${chalk.underline.bold(process.NAME)}\n` +
		`${chalk.magentaBright('█')} ${NODE_ENV}\n`
		+ (process.DEBUGGING ? `\n\n` : '')
	)
}

process.on('uncaughtException', function(error) {
	console.error(chalk.bold.redBright('UNCAUGHT EXCEPTION'), '->', error)
})
process.on('unhandledRejection', function(error) {
	console.error(chalk.bold.redBright('UNHANDLED REJECTION'), '->', error)
	if (PRODUCTION) process.exit(1);
})



import * as inspector from 'inspector'
if (process.DEBUGGING && DEVELOPMENT) {
	chalk.enabled = false
	inspector.open(process.debugPort + process.INSTANCE)
	process.onexit(function() {
		console.clear()
		inspector.close()
	})
}
declare global { namespace NodeJS { export interface Process { debugPort: number, DEBUGGING: boolean } } }


