// 

import chalk from 'chalk'
import * as path from 'path'



const pkg = require(path.resolve(process.cwd(), 'package.json'))
process.NAME = pkg.name
process.VERSION = pkg.version
process.DOMAIN = (DEVELOPMENT ? 'dev.' : '') + pkg.domain
process.SERVER = true



import * as os from 'os'
if (PRODUCTION || !Number.isFinite(process.INSTANCES)) process.INSTANCES = os.cpus().length;
process.INSTANCES = Math.max(process.INSTANCES, 1)
process.INSTANCE = process.env.NODE_APP_INSTANCE ? Number.parseInt(process.env.NODE_APP_INSTANCE) : 0
if (process.env.pm_uptime) {
	process.INSTANCES = Number.parseInt(process.env.instances) || os.cpus().length
	process.INSTANCE = Number.parseInt(process.env.NODE_APP_INSTANCE)
}
process.PRIMARY = process.INSTANCE == 0
declare global { namespace NodeJS { export interface ProcessEnv { NODE_APP_INSTANCE: string } export interface Process { PRIMARY: boolean } } }



import * as cluster from 'cluster'
process.MASTER = cluster.isMaster
process.WORKER = cluster.isWorker
declare global { namespace NodeJS { export interface Process { MASTER: boolean, WORKER: boolean } } }



import * as dotenv from 'dotenv'
dotenv.config({ path: path.resolve(process.cwd(), 'config/server.' + NODE_ENV + '.env') })
dotenv.config({ path: path.resolve(process.cwd(), 'config/server.env') })
process.HOST = process.env.HOST || '127.0.0.1'
process.PORT = Number.parseInt(process.env.PORT) || 12300
declare global { namespace NodeJS { export interface Process { HOST: string, PORT: number } } }



import * as inspector from 'inspector'
if (process.DEBUGGING) {
	chalk.enabled = false
	inspector.open(process.debugPort + process.INSTANCE)
	// process.on('beforeExit', inspector.close)
	// process.on('exit', inspector.close)
}
declare global { namespace NodeJS { export interface Process { debugPort: number, DEBUGGING: boolean } } }



process.on('uncaughtException', function(error) {
	console.error(chalk.bold.redBright('UNCAUGHT EXCEPTION'), '->', error)
})
process.on('unhandledRejection', function(error) {
	console.error(chalk.bold.redBright('UNHANDLED REJECTION'), '->', error)
	if (PRODUCTION) process.exit(1);
})



import * as clc from 'cli-color'
if (DEVELOPMENT && process.PRIMARY) {
	setInterval(() => process.stdout.write(clc.move.up(1)), 1000)
}



if (process.PRIMARY) {
	console.log(
		` \n \n \n \n${chalk.magentaBright('█')} ${chalk.underline.bold(process.NAME)}`,
		` \n${chalk.magentaBright('█')} ${chalk(NODE_ENV)} \n \n \n`,
	)
}


