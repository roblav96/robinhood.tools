// 

import * as chalk from 'chalk'
import * as _pino from 'pino'

declare module 'pino' {
	export interface PrettyPieces {
		prefix: string
		chalk: chalk.ChalkOptions
		asColoredLevel(value: any): any
		asColoredText(value: any, text: any): any
		filter(value: any, messageKey: any, eol: any): any
		formatTime(value: any, after: any): any
		withSpaces(value: any, eol: any): any
	}
	export type PrettyFormatter = (log: LogDescriptor, pieces?: PrettyPieces) => string
}


