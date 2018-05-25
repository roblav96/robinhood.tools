// 

process.env.SERVER = true
process.env.NODE_ENV = process.env.NODE_ENV || 'development'
if (process.env.NODE_ENV == 'development') process.env.DEVELOPMENT = true;
if (process.env.NODE_ENV == 'production') process.env.PRODUCTION = true;



import * as path from 'path'
import * as dotenv from 'dotenv'
if (process.env.PROJECT) {
	dotenv.config({ path: path.resolve(process.env.PROJECT, 'env/server.env') })
	dotenv.config({ path: path.resolve(process.env.PROJECT, 'env/server.' + process.env.NODE_ENV + '.env') })
}



import * as os from 'os'
import * as cluster from 'cluster'
if (cluster.isMaster) process.env.MASTER = true;
if (cluster.isWorker) process.env.WORKER = true;
process.env.CPUS = process.env.CPUS || os.cpus().length
process.env.SCALE = process.env.SCALE || 1
process.env.INSTANCE = cluster.isWorker ? cluster.worker.id - 1 : 0;
if (+process.env.INSTANCE == 0) process.env.PRIMARY = true;



process.env.OFFSET = +process.env.INSTANCE
process.env.ORDER = +process.env.INSTANCE
if (!+process.env.OFFSET && process.env.PRIMARY) process.env.FIRST = true;



import chalk from 'chalk'
process.on('uncaughtException', function(error) {
	console.error('UNCAUGHT EXCEPTION', '->', error)
})
process.on('unhandledRejection', function(error) {
	console.error('UNHANDLED PROMISE REJECTION', '->', error)
	if (process.env.PRODUCTION) process.exit(1);
})


