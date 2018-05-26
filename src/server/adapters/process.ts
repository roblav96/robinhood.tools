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



declare global { namespace NodeJS { interface ProcessEnv { MASTER: any; WORKER: any; INSTANCE: any; PRIMARY: any } } }
import * as cluster from 'cluster'
if (cluster.isMaster) process.env.MASTER = true;
if (cluster.isWorker) process.env.WORKER = true;
process.env.INSTANCE = cluster.isWorker ? cluster.worker.id - 1 : 0;
if (+process.env.INSTANCE == 0) process.env.PRIMARY = true;



import * as sigexit from 'signal-exit'
if (cluster.isWorker) {
	sigexit(() => cluster.worker.disconnect())
}



declare global { namespace NodeJS { interface ProcessEnv { CPUS: any } } }
import * as os from 'os'
process.env.CPUS = os.cpus().length



declare global { namespace NodeJS { interface ProcessEnv { INDEX: any; LENGTH: any; SCALE: any; PNAME: any } } }
import * as final from 'final-pm'
let app = (process.env.APPLICATION ? JSON.parse(process.env.APPLICATION) : {}) as final.Application & { index: number }
let apps = (process.env.APPLICATIONS ? JSON.parse(process.env.APPLICATIONS) : []) as final.Application[]
process.env.PNAME = app.name || 'app'
process.env.INDEX = app.index || 0
process.env.SCALE = app.instances || 0
process.env.LENGTH = apps.length || 1


