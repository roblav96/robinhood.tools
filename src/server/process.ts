// 



global.NODE_ENV = process.env.NODE_ENV || 'development'
global.DEVELOPMENT = NODE_ENV == 'development'
global.PRODUCTION = NODE_ENV == 'production'



import * as os from 'os'
import * as cluster from 'cluster'
process.INSTANCES = os.cpus().length;
process.INSTANCE = cluster.isWorker ? Number.parseInt(process.env.INSTANCE) : -1
process.PRIMARY = process.INSTANCE == 0
process.MASTER = cluster.isMaster
process.WORKER = cluster.isWorker



import * as path from 'path'
import * as dotenv from 'dotenv'
dotenv.config({ path: path.resolve(process.cwd(), 'config/server.' + NODE_ENV + '.env') })
dotenv.config({ path: path.resolve(process.cwd(), 'config/server.env') })
process.NAME = process.env.npm_package_name
process.VERSION = process.env.npm_package_version
process.DOMAIN = (DEVELOPMENT ? 'dev.' : '') + process.env.npm_package_domain
process.HOST = process.env.HOST || 'localhost'
process.PORT = Number.parseInt(process.env.PORT) || 12300
process.SERVER = true



import chalk from 'chalk'
process.on('uncaughtException', function(error) {
	console.error(chalk.bold.redBright('UNCAUGHT EXCEPTION'), '->', error)
})
process.on('unhandledRejection', function(error) {
	console.error(chalk.bold.redBright('UNHANDLED REJECTION'), '->', error)
	console.error('https://github.com/mcollina/make-promises-safe', '\n')
	process.exit(1)
})



if (process.MASTER) {
	console.log((
		`\n\n
		${chalk.magentaBright('█')} ${chalk.underline.bold(process.NAME)}
		${chalk.magentaBright('█')} ${NODE_ENV}
		`
	).replace(/\t/g, ''))
}


