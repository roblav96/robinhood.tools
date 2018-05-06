// 

process.env.SERVER = true
if (!process.env.NODE_ENV) process.env.NODE_ENV = 'development';
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



import * as Pandora from 'pandora'
process.env.OFFSET = Pandora.processContext ? Pandora.processContext.context.processRepresentation.offset : 0
process.env.ORDER = Pandora.processContext ? Pandora.processContext.context.processRepresentation.order : 0
// process.env.IPORT = +process.env.PORT + +process.env.OFFSET + +process.env.INSTANCE



import chalk from 'chalk'
process.on('uncaughtException', function(error) {
	console.error('UNCAUGHT EXCEPTION', '->', error)
})
process.on('unhandledRejection', function(error) {
	console.error('UNHANDLED PROMISE REJECTION', '->', error)
	if (process.env.PRODUCTION) process.exit(1);
})



// import * as exithook from 'exit-hook'
// exithook(function() {
// 	// console.log('code ->', code)
// 	// console.log('signal ->', signal)
// 	// process.kill(process.pid, code || signal)
// })
// exithook(() => process.kill(process.pid))
// process.on('SIGTERM', () => process.kill(process.pid, 143))
// process.on('SIGTERM', () => process.exit(143))

// const sigs = [
// 	'SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
// 	'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM',
// ]
// sigs.forEach(function(sig) {
// 	process.on(sig, function() {
// 		process.exit(123)
// 	})
// })


