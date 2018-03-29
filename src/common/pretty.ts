// 



import * as pms from 'pretty-ms'
export function ms(ms: number) {
	return pms(ms)
}

import * as pbytes from 'pretty-bytes'
export function bytes(bytes: number) {
	return pbytes(bytes)
}


import * as Humanize from 'humanize-plus'
export function plural(input: string, value: number) {
	return Humanize.pluralize(value, input)
}



import * as sourcemaps from 'source-map-support'
import * as stacktrace from 'stack-trace'
export function frame(frame: stacktrace.StackFrame) {
	frame = sourcemaps.wrapCallSite(frame)
	let pretty = {
		sourceUrl: frame.getFileName() || frame.getScriptNameOrSourceURL() || frame.getEvalOrigin(),
		fileName: null, fileExt: null,
		line: frame.getLineNumber(),
		column: frame.getColumnNumber(),
		position: frame.getPosition(),
		functionName: frame.getFunctionName(),
		typeName: frame.getTypeName(),
	} as Pretty.StackFrame
	if (pretty.sourceUrl) {
		let fileSplit = pretty.sourceUrl.split('/').pop().split('.')
		pretty.fileExt = fileSplit.pop()
		pretty.fileName = fileSplit.join('.')
	}
	return pretty
}
declare global { namespace Pretty { interface StackFrame { sourceUrl: string, fileName: string, fileExt: string, line: number, column: number, position: number, functionName: string, typeName: string } } }
// const FRAME_PROTOS = ['getColumnNumber', 'getEvalOrigin', 'getFileName', 'getFunction', 'getFunctionName', 'getLineNumber', 'getMethodName', 'getPosition', 'getScriptNameOrSourceURL', 'getThis', 'getTypeName', 'isConstructor', 'isEval', 'isNative', 'isToplevel']



// export function stackframes(frames: strace.StackFrame[]) {
// 	return frames.map(function(frame) {
// 		frame = sourcemaps.wrapCallSite(frame)
// 		let dumped = {}
// 		FRAME_PROTOS.forEach(function(proto) {
// 			dumped[proto] = frame[proto]()
// 		})
// 		return dumped as Dict<keyof strace.StackFrame>
// 	})
// }


