// 

import * as _chalk from 'chalk'
import * as _pino from 'pino'



declare module 'pino' {
	export interface PrettyConfig {
		prefix: string
		chalk: _chalk.ChalkOptions
		asColoredLevel(value: any): any
		asColoredText(value: any, text: any): any
		filter(value: any, messageKey: any, eol: any): any
		formatTime(value: any, after: any): any
		withSpaces(value: any, eol: any): any
	}
	export type PrettyFormatter = (log: LogDescriptor, config?: Partial<PrettyConfig>) => string
}


