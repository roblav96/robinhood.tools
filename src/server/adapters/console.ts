// 

import chalk from 'chalk'
import * as _ from 'lodash'
import * as moment from 'moment'



require('debug-trace')()
console.format = function(args) {
	let method = args.method as keyof Console
	let stack = new Error().stack.toString()
	stack = stack.replace(/^ {4}at /gm, '').split('\n')[4].trim()
	let fullpath = stack.split('/').pop()
	if (!fullpath) fullpath = args.filename + ':' + args.getLineNumber();
	let file = fullpath.split('.ts:')[0]
	let i = (fullpath.indexOf('.ts:') == -1) ? 0 : 1
	let line = fullpath.split('.ts:')[i].split(':')[0]
	let cdict = { log: 'blue', info: 'green', warn: 'yellow', error: 'red' } as Dict<string>
	let color = cdict[method] || 'magenta'
	let osquare = chalk[color + 'Bright']('█')
	if (method == 'error') color = color + 'Bright';
	let ofile = '[' + chalk.bold(chalk[color](file) + ':' + line) + ']'
	let oinstance = '[' + chalk.gray(process.INSTANCE) + ']'
	let otime = moment().format('hh:mm:ss:SSS')
	let output = osquare + ofile + oinstance + chalk.gray('T-') + otime
	// if (method == 'warn') {
	// 	output = chalk.bold.yellowBright('████  WARN  ████\n') + output
	// }
	// if (method == 'error') {
	// 	output = chalk.bold.redBright('████  ERROR  ████\n') + output
	// }
	return '\n\n' + chalk.underline(output) + '\n'
}
declare global { interface Console { format(args: any): void } }



import * as eyes from 'eyes'
_.merge(eyes.defaults, {
	maxLength: 65536, stream: null, showHidden: true, pretty: true,
	styles: { all: null, key: 'grey', special: 'red' },
} as eyes.EyesOptions)

Object.assign(console, {
	inspect(value: any) { return eyes.inspect(value) },
})
declare global { interface Console { inspect(value: any): string } }



import * as util from 'util'
_.merge(util.inspect, {
	defaultOptions: {
		showHidden: false,
		showProxy: false,
		depth: 2,
		compact: false,
		breakLength: Infinity,
		maxArrayLength: Infinity,
		colors: !!chalk.supportsColor,
	},
	styles: {
		string: 'green', regexp: 'green', date: 'green',
		number: 'magenta', boolean: 'blue',
		undefined: 'red', null: 'red',
		symbol: 'cyan', special: 'cyan',
	},
} as Partial<typeof util.inspect>)

Object.assign(console, {
	dump(value: any, opts = {}) {
		_.defaults(opts, {
			depth: 4, showHidden: true, showProxy: true,
		} as NodeJS.InspectOptions)
		return util.inspect(value, opts)
	},
})
declare global { interface Console { dump(value: any, opts?: NodeJS.InspectOptions): string } }



Object.assign(console, { dtsgen: _.noop })
if (DEVELOPMENT) {
	const dtsgen = require('../../common/dtsgen').default
	const clipboardy = require('clipboardy')
	Object.assign(console, {
		dtsgen(value: any) {
			let results = dtsgen(value) as string
			let paste = results.trim()
			clipboardy.write(paste.substring(1, paste.length - 2).trim())
			return results
		},
	})
}




