// 

import * as buefy from 'buefy/types/components'
import * as _ from '@/common/lodash'
import * as core from '@/common/core'
import vm from '@/client/vm'



export function toast(opts: string | buefy.ToastConfig) {
	if (core.string.is(opts)) opts = { message: opts };
	_.defaults(opts, {
		position: 'is-top',
		type: 'is-dark',
	} as buefy.ToastConfig)
	return vm.$toast.open(opts as any)
}



export function snackbar(opts: string | buefy.SnackbarConfig) {
	if (core.string.is(opts)) opts = { message: opts };
	_.defaults(opts, {
		position: 'is-top',
		actionText: 'Okay',
		type: 'is-rhgreen',
	} as buefy.SnackbarConfig)
	return vm.$snackbar.open(opts as any)
	// if (!opts.toPromise) return vm.$snackbar.open(opts as any);
	// return new Promise<void>(r => {
	// 	opts.onAction = r
	// 	vm.$snackbar.open(opts as any)
	// })
}

// declare global {
// 	interface SnackbarConfig extends buefy.SnackbarConfig {
// 		// toPromise: boolean
// 	}
// }


