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
let pkgjson = require(path.join(project, 'package.json'))
process.env.NAME = pkgjson.name
process.env.VERSION = pkgjson.version
process.env.DOMAIN = (process.env.DEVELOPMENT ? 'dev.' : '') + pkgjson.domain



import * as dotenv from 'dotenv'
dotenv.config({ path: path.resolve(project, 'env/server.env') })
dotenv.config({ path: path.resolve(project, `env/server.${process.env.NODE_ENV}.env`) })



import * as cluster from 'cluster'
if (cluster.isMaster) process.env.MASTER = true;
if (cluster.isWorker) process.env.WORKER = true;
if (process.env.FINAL_PM_INSTANCE_NUMBER) {
	process.env.INSTANCE = process.env.FINAL_PM_INSTANCE_NUMBER
} else {
	process.env.INSTANCE = cluster.isWorker ? cluster.worker.id - 1 : 0;
}
if (+process.env.INSTANCE == 0) process.env.PRIMARY = true;
declare global { namespace NodeJS { interface ProcessEnv { MASTER: any; WORKER: any; INSTANCE: any; PRIMARY: any } } }



import * as sigexit from 'signal-exit'
if (cluster.isWorker) {
	sigexit(() => cluster.worker.disconnect())
}



import * as os from 'os'
process.env.CPUS = os.cpus().length
declare global { namespace NodeJS { interface ProcessEnv { CPUS: any } } }



let rep = (process.env.REPRESENTATION ? JSON.parse(process.env.REPRESENTATION) : {}) as Representation
let reps = (process.env.REPRESENTATIONS ? JSON.parse(process.env.REPRESENTATIONS) : []) as Representation[]
process.env.NAME = rep.name
process.env.SCALE = rep.scale || 1
process.env.OFFSET = rep.offset || 0
process.env.LENGTH = reps.length || 1
declare global { namespace NodeJS { interface ProcessEnv { NAME: any; SCALE: any; OFFSET: any; LENGTH: any } } }


