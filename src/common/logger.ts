// // 

// import chalk from 'chalk'
// import * as util from 'util'
// import * as core from './core'
// import * as Pino from 'pino'
// import * as moment from 'moment'
// import * as sourcemaps from 'source-map-support'
// import * as stacktrace from 'stack-trace'



// const logger = Pino({
// 	// name: process.NAME,
// 	// level: 'warn',
// 	prettyPrint: {
// 		// errorLikeObjectKeys: [],
// 		formatter: (function(log, config) {
// 			// process.stdout.write(`\n\n${'formatter log'} ->\n${util.inspect(log)}`)
// 			// console.time('formatter')
			
// 			log.label = logger.levels.labels[log.level]
// 			if (log.pconsole) log.label = log.pconsole.method;

// 			let colors = { log: 'blue', info: 'green', debug: 'magenta', warn: 'yellow', error: 'red', fatal: 'red' } as Dict<string>
// 			let color = colors[log.label] || 'magenta'

// 			let square = chalk[color + 'Bright']('█')
// 			if (log.label == 'error') color = color + 'Bright';

// 			// log.stackframe = getStackFrame()
// 			let srcpath = log.stackframe.sourceUrl.replace('src/server/', '')
// 			let srcfile = log.stackframe.fileName + '.' + log.stackframe.fileExt
// 			let meta = '[' + chalk.grey(srcpath.replace(srcfile, '') + chalk.bold[color](srcfile)) + ':' + chalk.bold(log.stackframe.line) + '' + chalk.grey('➤' + (log.stackframe.functionName || '') + '()') + ']'
// 			let instance = '[' + chalk.gray(process.INSTANCE) + ']'
// 			let stamp = moment(log.time).format('hh:mm:ss:SSS')
// 			let header = square + meta + instance + chalk.gray('T-') + stamp
// 			header = chalk.underline(header)
// 			// console.log('header ->', header)

// 			let output = log.msg
// 			if (log.pconsole) output = log.pconsole.args.join('\n');

// 			// console.timeEnd('formatter')
// 			// console.log('AFTER log ->', log)
// 			return '\n\n' + header + '\n' + output

// 		} as Pino.PrettyFormatter) as any,
// 	},

// 	// serializers: {
// 	// 	'pconsole': function pconsole(pconsole: Logger.ConsoleLog) {
// 	// 		// console.log('pconsole ->', pconsole)
// 	// 		return pconsole
// 	// 	},
// 	// },

// })



// // global._console = {} as typeof console
// // declare global { var _console: Console; interface WindowConsole { readonly _console: Console } namespace NodeJS { export interface Global { _console: typeof console } } }

// // const methods = ['warn', 'log', 'info', 'error']
// // // if (DEVELOPMENT) methods.splice(1);
// // let i: number, len = methods.length
// // for (i = 0; i < len; i++) {
// // 	let method = methods[i]
// // 	Object.assign(global._console, { [method]: global.console[method] })
// // 	Object.assign(global.console, {
// // 		[method](...args) {
// // 			// global._console[method].apply(global._console, args)
// // 			logger[(method == 'log' ? 'info' : method)].apply(logger, [{ pconsole: { method, args } }])
// // 		},
// // 	})
// // }

// // export default logger





// // export function stackframes(frames: strace.StackFrame[]) {
// // 	return frames.map(function(frame) {
// // 		frame = sourcemaps.wrapCallSite(frame)
// // 		let dumped = {}
// // 		FRAME_PROTOS.forEach(function(proto) {
// // 			dumped[proto] = frame[proto]()
// // 		})
// // 		return dumped as Dict<keyof strace.StackFrame>
// // 	})
// // }


