// 

import chalk from 'chalk'
import * as _ from '../../common/lodash'



import * as moment from 'moment'
if (!Number.isFinite(process.DEBUGGERS)) {
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
		// 	output = chalk.bold.yellowBright('████  WARN  ████ \n') + output
		// }
		if (method == 'error') {
			output = chalk.bold.redBright('████  ERROR  ████ \n') + output
		}
		output = '\n\n' + chalk.underline(output) + '\n'
		return output
	}
}
declare global { interface Console { format(args: any): void } }



import * as util from 'util'
_.merge(util.inspect, {
	defaultOptions: {
		depth: 2,
		showHidden: false, showProxy: false,
		compact: !chalk.enabled, colors: chalk.enabled,
		breakLength: Infinity, maxArrayLength: Infinity,
	},
	styles: {
		string: 'green', regexp: 'green', date: 'green',
		number: 'magenta', boolean: 'blue',
		undefined: 'red', null: 'red',
		symbol: 'cyan', special: 'cyan',
	},
} as Partial<typeof util.inspect>)



// import * as clipboardy from 'clipboardy'
import dtsgen from '../../common/dtsgen'
Object.assign(console, { dtsgen: _.noop })
if (DEVELOPMENT) {
	Object.assign(console, {
		dtsgen(value: any) {
			return dtsgen(value)
			// let results = dtsgen(value)
			// clipboardy.write(results.trim())
			// return results
		},
	})
}


