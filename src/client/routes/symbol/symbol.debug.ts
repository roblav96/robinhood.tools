// 

import * as Vts from 'vue-property-decorator'
import { mixins as Mixins } from 'vue-class-component'
import Vue from 'vue'
import VMixin from '../../mixins/v.mixin'
import Symbol from './symbol'
import dayjs from '../../../common/dayjs'
import * as core from '../../../common/core'
import * as rkeys from '../../../common/rkeys'
import * as utils from '../../adapters/utils'
import * as http from '../../../common/http'



@Vts.Component
export default class extends Mixins(VMixin) {
	$parent: Symbol
	symbol = this.$parent.symbol
	all = this.$parent.all

	tabindex = 0
	get allkeys() { return Object.keys(this.all).filter(k => k != 'symbol') }
	tabledata(allkey: string) {
		return Object.keys(this.all[allkey]).filter(key => {
			return !Array.isArray(this.all[allkey][key])
		}).map(key => ({
			key, value: this.all[allkey][key],
		})).sort((a, b) => core.sort.alphabetically(a.key, b.key))
	}

	vrowkey(key: string) {
		return this.vcapitalize(this.vscase(key))
	}

	vrowvalue(value: any, key: string) {
		let k = key.toLowerCase()
		if (core.number.isFinite(value)) {
			if (k.includes('time') || k.includes('date')) {
				return utils.tFormat(value, { verbose: true })
			}
			return utils.nFormat(value, { nozeros: true })
		}
		if (core.boolean.is(value)) {
			if (core.boolean.is(value)) return !value ? 'No' : 'Yes';
		}
		if (core.string.is(value)) {

		}
		return value
	}



}


