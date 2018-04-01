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



process.once('uncaughtException', error => console.error('UNCAUGHT EXCEPTION ->', error))
process.once('unhandledRejection', function(error) {
	console.error('UNHANDLED REJECTION ->', error)
	console.log('https://github.com/mcollina/make-promises-safe')
	process.exit(1)
})



declare global { namespace NodeJS { interface Process { dtsgen: (name: string, typings: any) => void } } }
if (DEVELOPMENT) {
	const dtsgen = require('dts-gen')
	const clipboardy = require('clipboardy')
	process.dtsgen = function(name, typings) {
		if (typings == null) return;
		// let results = dtsgen.generateIdentifierDeclarationFile('typings', typings)
		let results = dtsgen.generateModuleDeclarationFile('typings', typings)
		console.info('dtsgen', name, '->', results)
		clipboardy.write(results)
	}
}


