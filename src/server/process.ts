// 

import * as eyes from 'eyes'
import * as clc from 'cli-color'
import * as _ from 'rambda'

import * as os from 'os'
import * as cluster from 'cluster'
import * as path from 'path'
import * as url from 'url'
import * as ee3 from 'eventemitter3'
import * as moment from 'moment'
import * as dotenv from 'dotenv'



Object.assign((eyes as any).defaults, { maxLength: 65536, showHidden: true } as eyes.EyesOptions)

global.NODE_ENV = process.env.NODE_ENV as any
global.DEVELOPMENT = NODE_ENV == 'development'
global.PRODUCTION = NODE_ENV == 'production'

dotenv.config({ path: path.resolve(process.cwd(), '.server.' + NODE_ENV + '.local') })

process.EE3 = new ee3.EventEmitter()
process.INSTANCES = os.cpus().length
process.INSTANCE = cluster.isWorker ? Number.parseInt(cluster.worker.id as any) - 1 : -1
process.PRIMARY = process.INSTANCE == 0
process.MASTER = cluster.isMaster
process.WORKER = cluster.isWorker



require('debug-trace')()
console.format = function(args) {
	let time = moment().format('hh:mm:ss:SSS')
	let instance = '[' + process.INSTANCE + ']'
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
	let output = clc[color + 'Bright']('▉') + time + instance
	if (args.method == 'warn') {
		output = clc.yellowBright('=============================== WARN ================================\n') + output
		// file = clc.yellow(file)
	} else if (args.method == 'error') {
		output = clc.redBright('=============================== ERROR ================================\n') + output
		// file = clc.redBright(file)
	} else {
		// file = clc[color](file)
	}
	output += '[' + clc.bold(file) + ':' + line + ']'
	return '\n \n' + clc.underline(output) + '\n'
}



process.on('uncaughtException', function(error) {
	console.error('uncaughtExceptions > error', error)
})
process.on('unhandledRejection', function(error) {
	console.error('unhandledRejection > error', error)
	process.exit(1)
})



if (DEVELOPMENT) {
	if (process.MASTER) setInterval(process.stdout.write, 1000, (clc as any).erase.lineRight);
	// const dtsgen = require('dts-gen')
	// const clipboardy = require('clipboardy')
	// process.dtsgen = function(name, value) {
	// 	name = name.replace(/\W+/g, '').trim()
	// 	let results = dtsgen.generateIdentifierDeclarationFile(name, value)
	// 	clipboardy.write(results).then(function() {
	// 		console.warn('/*████  DTS COPPIED > "' + clc.bold(name) + '"  ████*/')
	// 	}).catch(function(error) {
	// 		console.error('clipboardy.write > error', error)
	// 	})
	// }
	// process.clipboard = function(name, input) {
	// 	clipboardy.write(input).then(function() {
	// 		console.warn('/*████  "' + clc.bold(name) + '" > APPENDED TO CLIPBOARD  ████*/')
	// 	}).catch(function(error) {
	// 		console.error('clipboardy.write > error', error)
	// 	})
	// }
}


