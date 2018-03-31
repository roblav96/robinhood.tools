// // 

// import * as core from '../../common/core'
// import * as Pino from 'pino'
// import * as uws from 'uws'
// import * as moment from 'moment'
// import * as sourcemaps from 'source-map-support'
// import * as stacktrace from 'stack-trace'



// const logger = Pino({
// 	level: 'debug',
// 	prettyPrint: {
// 		levelFirst: true, forceColor: true,
// 		// errorLikeObjectKeys: [],
// 		// formatter: (function(log, config) {
// 		// 	let method = logger.levels.labels[log.level]
// 		// 	if (!global.console[method]) method = 'error';
// 		// 	global.console[method]('logger ->', log.msg)
// 		// 	return ''
// 		// } as Pino.PrettyFormatter) as any,
// 	},
// })

// // import logger from '../adapters/logger'
// // const fastify = Fastify({ logger })
// export default logger



// // const _console = {} as typeof console
// // const methods = ['warn', 'log', 'info', 'error']
// // let i: number, len = methods.length
// // for (i = 0; i < len; i++) {
// // 	let method = methods[i]
// // 	Object.assign(_console, { [method]: console[method] })
// // 	Object.assign(console, {
// // 		[method](...args) {
// // 			logger[(method == 'log' ? 'info' : method)].apply(logger, args)
// // 			// _console[method].apply(_console, args)
// // 		},
// // 	})
// // }



// // function getStackFrame() {
// // 	let frames = stacktrace.get()
// // 	let index = frames.findIndex(function(frame) {
// // 		let isemitter = frame.getTypeName() == 'EventEmitter'
// // 		let ispino = frame.getFileName() == 'pino' || frame.getFunctionName() == 'pinoWrite'
// // 		return isemitter && ispino
// // 	})
// // 	let frame = parseStackFrame(frames[index + 2])
// // 	return frame
// // }

// // const FRAME_PROTOS = ['getColumnNumber', 'getEvalOrigin', 'getFileName', 'getFunction', 'getFunctionName', 'getLineNumber', 'getMethodName', 'getPosition', 'getScriptNameOrSourceURL', 'getThis', 'getTypeName', 'isConstructor', 'isEval', 'isNative', 'isToplevel']
// // function parseStackFrame(frame: stacktrace.StackFrame) {
// // 	frame = sourcemaps.wrapCallSite(frame)
// // 	let parsed = {
// // 		filePath: frame.getFileName() || frame.getScriptNameOrSourceURL() || frame.getEvalOrigin(),
// // 		fileName: null, fileExt: null,
// // 		line: frame.getLineNumber(),
// // 		column: frame.getColumnNumber(),
// // 		position: frame.getPosition(),
// // 		functionName: frame.getFunctionName(),
// // 		typeName: frame.getTypeName(),
// // 	} as Logger.StackFrame
// // 	if (parsed.filePath) {
// // 		let fileSplit = parsed.filePath.split('/').pop().split('.')
// // 		parsed.fileExt = fileSplit.pop()
// // 		parsed.fileName = fileSplit.join('.')
// // 		if (core.isNodejs) parsed.filePath = parsed.filePath.replace(process.cwd() + '/', '');
// // 	}
// // 	return parsed
// // }





// // declare global {
// // 	namespace Logger {
// // 		interface StackFrame { filePath: string, fileName: string, fileExt: string, functionName: string, typeName: string, line: number, column: number, position: number }
// // 	}
// // }

// // declare module 'pino' {
// // 	interface LogDescriptor {

// // 	}
// // }




