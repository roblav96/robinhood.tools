// 

import 'source-map-support/register'
import * as eyes from 'eyes'
eyes.defaults.maxLength = 65536
eyes.defaults.showHidden = true

// 

import chalk from 'chalk'
import * as os from 'os'
import * as cluster from 'cluster'
import * as path from 'path'
import * as ee3 from 'eventemitter3'
import * as moment from 'moment'
import * as dotenv from 'dotenv'



global.NODE_ENV = process.env.NODE_ENV || 'development'
global.DEVELOPMENT = NODE_ENV == 'development'
global.PRODUCTION = NODE_ENV == 'production'

dotenv.config({ path: path.resolve(process.cwd(), 'config/server.' + NODE_ENV + '.env') })
process.NAME = process.env.npm_package_name
process.VERSION = process.env.npm_package_version
process.DOMAIN = (DEVELOPMENT ? 'http://dev.' : 'https://') + process.env.npm_package_domain
process.HOST = process.env.HOST
process.PORT = Number.parseInt(process.env.PORT)

process.INSTANCES = os.cpus().length
process.INSTANCE = cluster.isWorker ? Number.parseInt(cluster.worker.id as any) - 1 : -1
process.PRIMARY = process.INSTANCE == 0
process.MASTER = cluster.isMaster
process.WORKER = cluster.isWorker

process.EE3 = new ee3.EventEmitter()



require('debug-trace')()
console.format = function(args) {
	let stack = new Error().stack.toString()
	stack = stack.replace(/^ {4}at /gm, '').split('\n')[4].trim()
	let fullpath = stack.split('/').pop()
	if (!fullpath) fullpath = args.filename + ':' + args.getLineNumber();
	let file = fullpath.split('.ts:')[0]
	let i = (fullpath.indexOf('.ts:') == -1) ? 0 : 1
	let line = fullpath.split('.ts:')[i].split(':')[0]
	let cdict = { log: 'blue', info: 'green', warn: 'yellow', error: 'red' } as Dict<string>
	let color = cdict[args.method] || 'magenta'
	let osquare = chalk[color + 'Bright']('█')
	let ofile = '[' + chalk.bold(chalk[color](file) + ':' + line) + ']'
	let oinstance = '[' + chalk.gray(process.INSTANCE) + ']'
	let otime = moment().format('hh:mm:ss:SSS')
	let output = osquare + ofile + oinstance + chalk.gray('T-') + otime
	if (args.method == 'error') output = chalk.bold.redBright('=============================== ERROR ================================\n') + output;
	return '\n\n' + chalk.reset.underline(output) + '\n'
}



process.on('uncaughtException', function(error) {
	console.error(chalk.bold.underline.redBright('UNCAUGHT EXCEPTION') + ' Error >', error)
})
process.on('unhandledRejection', function(error) {
	console.error(chalk.bold.underline.redBright('UNHANDLED REJECTION') + ' Error >', error)
	// process.exit(1) // https://github.com/mcollina/make-promises-safe
})



if (DEVELOPMENT) {
	const dtsgen = require('dts-gen')
	const clipboardy = require('clipboardy')
	process.dtsgen = function(name, value) {
		name = name.replace(/\W+/g, '').trim()
		let results = dtsgen.generateIdentifierDeclarationFile(name, value)
		clipboardy.write(results).then(function() {
			console.info('dtsgen > "' + chalk.bold(name) + '"')
		}).catch(error => console.error('dtsgen Error >', error))
	}
	process.clipboard = function(name, input) {
		clipboardy.write(input).then(function() {
			console.info('clipboard > "' + chalk.bold(name) + '"')
		}).catch(error => console.error('clipboard Error >', error))
	}
}



if (process.MASTER) {
	process.stdout.write('\n\n' +
		'█ ' + chalk.underline.magenta(process.NAME) + '\n' +
		'█ ' + NODE_ENV + '\n' +
		'█ ' + process.HOST + ':' + process.PORT + '\n'
	)
}


