// 

import chalk from 'chalk'
import * as os from 'os'
import * as cluster from 'cluster'
import * as path from 'path'
import * as dotenv from 'dotenv'



const pkg = require(path.resolve(process.cwd(), 'package.json'))
process.NAME = pkg.name
process.VERSION = pkg.version
process.DOMAIN = (DEVELOPMENT ? 'dev.' : '') + pkg.domain
process.SERVER = true



process.INSTANCES = process.env.instances ? Number.parseInt(process.env.instances) : os.cpus().length
process.INSTANCE = process.env.NODE_APP_INSTANCE ? Number.parseInt(process.env.NODE_APP_INSTANCE) : 0
process.PRIMARY = process.INSTANCE == 0
declare global { namespace NodeJS { export interface ProcessEnv { NODE_APP_INSTANCE: string } export interface Process { INSTANCE: number, INSTANCES: number, PRIMARY: boolean } } }



process.MASTER = cluster.isMaster
process.WORKER = cluster.isWorker
declare global { namespace NodeJS { export interface Process { MASTER: boolean, WORKER: boolean } } }



dotenv.config({ path: path.resolve(process.cwd(), 'config/server.' + NODE_ENV + '.env') })
dotenv.config({ path: path.resolve(process.cwd(), 'config/server.env') })
process.HOST = process.env.HOST || '127.0.0.1'
process.PORT = Number.parseInt(process.env.PORT) || 12300
declare global { namespace NodeJS { export interface Process { HOST: string, PORT: number } } }



process.on('uncaughtException', function(error) {
	console.error(chalk.bold.redBright('UNCAUGHT EXCEPTION'), '->', error)
})
process.on('unhandledRejection', function(error) {
	console.error(chalk.bold.redBright('UNHANDLED REJECTION'), '->', error)
	console.error('https://github.com/mcollina/make-promises-safe')
	process.exit(1)
})



if (process.PRIMARY) {
	console.log(' \n \n')
	console.log(`${chalk.magentaBright('█')} ${chalk.underline.bold(process.NAME)}`)
	console.log(`${chalk.magentaBright('█')} ${chalk(NODE_ENV)}`)
}


