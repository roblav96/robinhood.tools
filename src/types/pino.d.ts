// 

import * as chalk from 'chalk'
import * as pino from 'pino'

declare module 'pino' {

	export interface PrettyOptions {
		dateFormat?: string
		errorProps?: string[]
		errorLikeObjectKeys?: string[]
		localTime?: boolean
	}
	export type PrettyFormatter = (log: LogDescriptor, config: PrettyConfig) => string

	export interface LogDescriptor extends Pretty.StackFrame {
		method: string
		release: string
		instance: number
		[index: number]: any
	}

	export interface PrettyConfig {
		prefix: string
		chalk: chalk.ChalkOptions
		asColoredLevel(value: any): any
		asColoredText(value: any, text: any): any
		filter(value: any, messageKey: any, eol: any): any
		formatTime(value: any, after: any): any
		withSpaces(value: any, eol: any): any
	}

}


