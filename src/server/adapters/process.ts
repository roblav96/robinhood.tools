// 

process.env.SERVER = true
process.env.NODE_ENV = process.env.NODE_ENV || 'development'
if (process.env.NODE_ENV == 'development') process.env.DEVELOPMENT = true;
if (process.env.NODE_ENV == 'production') process.env.PRODUCTION = true;



process.on('uncaughtException', function(error) {
	console.error('UNCAUGHT EXCEPTION', '->', error)
})
process.on('unhandledRejection', function(error) {
	console.error('UNHANDLED PROMISE REJECTION', '->', error)
	if (process.env.PRODUCTION) process.exit(1);
})



import * as path from 'path'
import * as pkgup from 'pkg-up'
let project = path.dirname(pkgup.sync())
let pkgjson = require(path.resolve(project, 'package.json'))
process.env.VERSION = pkgjson.version
process.env.DOMAIN = (process.env.DEVELOPMENT ? 'dev.' : '') + pkgjson.domain
process.env.NAME = process.env.NAME || pkgjson.name
process.env.SCALE = process.env.SCALE || 1
process.env.OFFSET = process.env.OFFSET || 0
process.env.LENGTH = process.env.LENGTH || 1



import * as dotenv from 'dotenv'
dotenv.config({ path: path.resolve(project, 'env/server.env') })
dotenv.config({ path: path.resolve(project, `env/server.${process.env.NODE_ENV}.env`) })



import * as cluster from 'cluster'
process.env.INSTANCE = process.env.FINAL_PM_INSTANCE_NUMBER || (cluster.isWorker ? cluster.worker.id - 1 : 0)
if (+process.env.INSTANCE == 0) process.env.PRIMARY = true;
declare global { namespace NodeJS { interface ProcessEnv { INSTANCE: any; PRIMARY: any } } }



import * as exithook from 'exit-hook'
if (cluster.isWorker) {
	exithook(() => cluster.worker.disconnect())
}



import * as os from 'os'
process.env.CPUS = os.cpus().length
declare global { namespace NodeJS { interface ProcessEnv { CPUS: any } } }


