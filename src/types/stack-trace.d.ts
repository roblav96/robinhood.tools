// 

import * as strace from 'stack-trace'

declare module 'stack-trace' {
	export interface StackFrame {
		getColumnNumber(): number
		getEvalOrigin(): string
		getFileName(): string
		getFunction(): Function
		getFunctionName(): string
		getLineNumber(): number
		getMethodName(): string
		getPosition(): number
		getScriptNameOrSourceURL(): string
		getThis(): this
		getTypeName(): string
		isConstructor(): boolean
		isEval(): boolean
		isNative(): boolean
		isToplevel(): boolean
	}
}
