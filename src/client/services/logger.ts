// 

import Pino from 'pino'



const logger = Pino({
	browser: {
		asObject: true,
		write: log => {
			console.debug(log)
		},
	},
})



global._console = {} as typeof console
declare global { var _console: Console; interface WindowConsole { readonly _console: Console } namespace NodeJS { export interface Global { _console: typeof console } } }

const methods = ['warn', 'log', 'info', 'error']
// if (DEVELOPMENT) methods.splice(1);
let i: number, len = methods.length
for (i = 0; i < len; i++) {
	let method = methods[i]
	Object.assign(global._console, { [method]: global.console[method] })
	Object.assign(global.console, {
		[method](...args) {
			global._console[method].apply(global._console, args)
			logger[(method == 'log' ? 'info' : method)].apply(logger, args)
		},
	})
}

export default logger



logger.info('omgerddd')




