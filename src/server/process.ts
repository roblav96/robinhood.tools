// 

import chalk from 'chalk'
import * as eyes from 'eyes'
import * as _ from 'lodash'

import * as os from 'os'
import * as cluster from 'cluster'
import * as path from 'path'
import * as ee3 from 'eventemitter3'
import * as moment from 'moment'
import * as dotenv from 'dotenv'



global.NODE_ENV = process.env.NODE_ENV as any
global.DEVELOPMENT = NODE_ENV == 'development'
global.PRODUCTION = NODE_ENV == 'production'

Object.assign((eyes as any).defaults, { maxLength: 131072, showHidden: true } as eyes.EyesOptions)
dotenv.config({ path: path.resolve(process.cwd(), '.server.' + NODE_ENV + '.local') })

process.DNAME = process.env.DNAME
process.VERSION = process.env.VERSION
process.DOMAIN = process.env.DOMAIN
process.HOST = process.env.HOST
process.PORT = Number.parseInt(process.env.PORT)

process.INSTANCES = os.cpus().length
process.INSTANCE = cluster.isWorker ? Number.parseInt(cluster.worker.id as any) - 1 : -1
process.PRIMARY = process.INSTANCE == 0
process.MASTER = cluster.isMaster
process.WORKER = cluster.isWorker

process.EE3 = new ee3.EventEmitter()



if (DEVELOPMENT) process.INSTANCES = 1;

// if (process.MASTER) process.env.GUN_ENV = 'debug';
// process.env.GUN_ENV = 'debug'



require('debug-trace')()
console.format = function(args) {
	// eyes.inspect(args, 'args')
	let stack = new Error().stack.toString()
	// eyes.inspect(stack, 'stack')
	stack = stack.replace(/^ {4}at /gm, '').split('\n')[4].trim()
	let fullpath = stack.split('/').pop()
	if (!fullpath) fullpath = args.filename + ':' + args.getLineNumber();
	let file = fullpath.split('.ts:')[0]
	let i = (fullpath.indexOf('.ts:') == -1) ? 0 : 1
	let line = fullpath.split('.ts:')[i].split(':')[0]
	let cdict = { log: 'blue', info: 'green', warn: 'yellow', error: 'red' } as Dict<string>
	let color = cdict[args.method] || 'magenta'

	let osquare = chalk[color + 'Bright']('▉')
	let ofile = '[' + chalk.bold(chalk[color](file) + ':' + line) + ']'
	let otime = moment().format('hh:mm:ss:SSS')
	let oinstance = '[' + process.INSTANCE + ']'
	let output = osquare + ofile + '' + oinstance + 'T-' + otime

	// let output = chalk[color + 'Bright']('▉') + time + instance
	// if (args.method == 'error') output = chalk.redBright('=============================== ERROR ================================\n') + output;
	// output = output + '[' + chalk.bold(file) + ':' + line + ']'

	return '\n \n' + chalk.reset.underline(output) + '\n'
}



process.on('uncaughtException', function(error) {
	console.error('uncaughtException >', error)
})
process.on('unhandledRejection', function(error) {
	console.error('unhandledRejection >', error)
	process.exit(1)
})



if (DEVELOPMENT) {
	if (process.MASTER) require('ora')({ spinner: 'runner', interval: 1000, hideCursor: false, stream: process.stdout }).start();
	const dtsgen = require('dts-gen')
	const clipboardy = require('clipboardy')
	process.dtsgen = function(name, value) {
		name = name.replace(/\W+/g, '').trim()
		let results = dtsgen.generateIdentifierDeclarationFile(name, value)
		clipboardy.write(results).then(function() {
			console.warn('/*████  DTS COPPIED > "' + chalk.bold(name) + '"  ████*/')
		}).catch(function(error) {
			console.error('clipboardy.write > error', error)
		})
	}
	process.clipboard = function(name, input) {
		clipboardy.write(input).then(function() {
			console.warn('/*████  "' + chalk.bold(name) + '" > APPENDED TO CLIPBOARD  ████*/')
		}).catch(function(error) {
			console.error('clipboardy.write > error', error)
		})
	}
}


