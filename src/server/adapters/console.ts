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
	let file = fullpath.split(':')[0]
	let i = (fullpath.indexOf(':') == -1) ? 0 : 1
	let line = fullpath.split(':')[i].split(':')[0]
	let cdict = { log: 'blue', info: 'green', warn: 'yellow', error: 'red' } as Dict<string>
	let color = cdict[method] || 'magenta'
	let osquare = chalk[color + 'Bright']('█')
	if (method == 'error') color = color + 'Bright';
	let ofile = '[' + chalk.bold(chalk[color](file) + ':' + line) + ']'
	let oinstance = '[' + chalk.gray(process.INSTANCE) + ']'
	let otime = moment().format('hh:mm:ss:SSS')
	let output = osquare + ofile + oinstance + chalk.gray('T-') + otime
	if (method == 'error') output = chalk.bold.redBright('=============================== ERROR ================================\n') + output;
	return '\n\n' + chalk.underline(output) + '\n'
}



import * as util from 'util'
_.merge(util.inspect, {
	defaultOptions: {
		showHidden: true,
		showProxy: true,
		depth: 1,
		colors: true,
		compact: false,
		breakLength: Infinity,
		maxArrayLength: Infinity,
	},
	styles: {
		string: 'green', regexp: 'green', date: 'green',
		number: 'magenta', boolean: 'blue',
		undefined: 'grey', null: 'grey',
		symbol: 'yellow', special: 'cyan',
	},
} as Partial<typeof util.inspect>)



import * as eyes from 'eyes'
_.merge(eyes.defaults, { styles: { all: 'grey' }, maxLength: 65536, showHidden: true, pretty: true } as eyes.EyesOptions)
const inspector = eyes.inspector(_.defaults({ stream: null } as eyes.EyesOptions, eyes.defaults))
Object.assign(eyes, { stringify(value: any) { return chalk.reset[eyes.defaults.styles.all](inspector(value)) } })


