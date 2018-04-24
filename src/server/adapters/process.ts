// 

process.env.SERVER = true
if (process.env.NODE_ENV == 'development') process.env.DEVELOPMENT = true;
if (process.env.NODE_ENV == 'production') process.env.PRODUCTION = true;



import * as cluster from 'cluster'
if (cluster.isMaster) process.env.MASTER = true;
if (cluster.isWorker) process.env.WORKER = true;
process.env.INSTANCES = process.env.INSTANCES || 1
process.env.INSTANCE = cluster.isWorker ? cluster.worker.id - 1 : 0;
if (process.env.INSTANCE == 0) process.env.PRIMARY = true;

process.env.HOST = process.env.HOST || '127.0.0.1'
process.env.PORT = +(process.env.PORT || 12300) + +process.env.INSTANCE



import * as path from 'path'
import * as dotenv from 'dotenv'
dotenv.config({ path: path.resolve(process.env.PROJECT, 'env/server.env') })
dotenv.config({ path: path.resolve(process.env.PROJECT, 'env/server.' + process.env.NODE_ENV + '.env') })



process.on('uncaughtException', function(error) {
	console.error('UNCAUGHT EXCEPTION Error ->', error)
})
process.on('unhandledRejection', function(error) {
	console.error('UNHANDLED REJECTION Error ->', error)
	if (process.env.PRODUCTION) process.exit(1);
})

process.once('beforeExit', () => setTimeout(() => process.kill(process.pid), 300))


