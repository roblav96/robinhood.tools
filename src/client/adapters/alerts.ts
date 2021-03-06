//

import Vue from 'vue'
import * as buefy from 'buefy/types/components'
import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import vm from '../vm'

export function toast(opts: string | buefy.ToastConfig) {
	if (core.string.is(opts)) opts = { message: opts }
	core.object.repair(opts, {
		position: 'is-top',
		type: 'is-warning',
	} as buefy.ToastConfig)
	return vm.$toast.open(opts as any) as void
}

export function snackbar(opts: string | buefy.SnackbarConfig) {
	if (core.string.is(opts)) opts = { message: opts }
	core.object.repair(opts, {
		position: 'is-top',
		actionText: 'Okay',
		type: 'is-dark',
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
