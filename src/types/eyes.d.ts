// 

import * as eyes from 'eyes'

declare module 'eyes' {
	export interface EyesOptions { showHidden?: boolean }
	export const defaults: eyes.EyesOptions
	export function stringify(value: any): string
}


