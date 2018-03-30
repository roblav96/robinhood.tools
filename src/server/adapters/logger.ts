// 

import * as core from '../../common/core'
import * as Pino from 'pino'
import * as uws from 'uws'
import * as moment from 'moment'
import * as sourcemaps from 'source-map-support'
import * as stacktrace from 'stack-trace'
import * as redis from './redis'
import radio from '../services/radio'



const logger = Pino({
	level: 'debug',
	prettyPrint: {
		errorLikeObjectKeys: [],
		formatter: (function(log, config) {
			// console.log('log ->', log)

			let output = log.msg

			radio.emit('log', output)
			// return log.msg
			
			return ''

		} as Pino.PrettyFormatter) as any,
	},
})



// const _console = {} as typeof console
// const methods = ['warn', 'log', 'info', 'error']
// let i: number, len = methods.length
// for (i = 0; i < len; i++) {
// 	let method = methods[i]
// 	Object.assign(_console, { [method]: console[method] })
// 	Object.assign(console, {
// 		[method](...args) {
// 			logger[(method == 'log' ? 'info' : method)].apply(logger, args)
// 			// _console[method].apply(_console, args)
// 		},
// 	})
// }

export default logger





function getStackFrame() {
	let frames = stacktrace.get()
	let index = frames.findIndex(function(frame) {
		let isemitter = frame.getTypeName() == 'EventEmitter'
		let ispino = frame.getFileName() == 'pino' || frame.getFunctionName() == 'pinoWrite'
		return isemitter && ispino
	})
	let frame = parseStackFrame(frames[index + 2])
	return frame
}

function parseStackFrame(frame: stacktrace.StackFrame) {
	frame = sourcemaps.wrapCallSite(frame)
	let parsed = {
		sourceUrl: frame.getFileName() || frame.getScriptNameOrSourceURL() || frame.getEvalOrigin(),
		fileName: null, fileExt: null,
		line: frame.getLineNumber(),
		column: frame.getColumnNumber(),
		position: frame.getPosition(),
		functionName: frame.getFunctionName(),
		typeName: frame.getTypeName(),
	} // as Logger.StackFrame
	if (parsed.sourceUrl) {
		let fileSplit = parsed.sourceUrl.split('/').pop().split('.')
		parsed.fileExt = fileSplit.pop()
		parsed.fileName = fileSplit.join('.')
		if (core.isNodejs) parsed.sourceUrl = parsed.sourceUrl.replace(process.cwd() + '/', '');
	}
	return parsed
}





declare global {
	namespace Logger {
		interface StackFrame { sourceUrl: string, fileName: string, fileExt: string, line: number, column: number, position: number, functionName: string, typeName: string }
	}
}

declare module 'pino' {
	interface BaseLogger {
		emit(event: 'log', ...args: any[]): boolean
		on(event: 'log', listener: (...args: any[]) => void): this
		addListener(event: 'log', listener: (...args: any[]) => void): this
		once(event: 'log', listener: (...args: any[]) => void): this
		prependListener(event: 'log', listener: (...args: any[]) => void): this
		prependOnceListener(event: 'log', listener: (...args: any[]) => void): this
		removeListener(event: 'log', listener: (...args: any[]) => void): this
	}
	interface LogDescriptor {

	}
}




