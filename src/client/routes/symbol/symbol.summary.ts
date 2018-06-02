// 

import * as Vts from 'vue-property-decorator'
import { mixins as Mixins } from 'vue-class-component'
import Vue from 'vue'
import VMixin from '@/client/mixins/v.mixin'
import Symbol from './symbol'
import * as url from 'url'
import * as _ from '@/common/lodash'
import * as core from '@/common/core'
import * as rkeys from '@/common/rkeys'
import * as http from '@/client/adapters/http'
import * as utils from '@/client/adapters/utils'
import dayjs from '@/common/dayjs'
import socket from '@/client/adapters/socket'



@Vts.Component
export default class extends Mixins(VMixin) {
	$parent: Symbol
	symbol = this.$parent.symbol
	all = this.$parent.all

	created() {

	}

	schemas = [
		{
			name: 'Definition', icon: 'book-open',
			defs: [
				{ key: 'fullName', title: 'Official Name' },
				{ key: 'issueType' },
				{ key: 'currency' },
				{ key: 'country' },
				{ key: 'timezone' },
				{ key: 'website' },
			],
		},
		{
			name: 'Exchange', icon: 'bank',
			defs: [
				{ key: 'exchange', title: 'Name' },
				{ key: 'acronym' },
				{ key: 'mic', title: 'Operating MIC' },
				{ key: 'listDate' },
				{ key: 'status' },
				{ key: 'alive', title: 'Tradable' },
			],
		},
	] as Schema[]

	vvalue(key: keyof Quotes.Quote) {
		let value = this.all.quote[key]
		if (value) {
			if (key == 'website') return url.parse(value as any).host;
			if (key == 'listDate') return dayjs(value).format('MMMM DD, YYYY');
		}
		if (core.number.isFinite(value)) return utils.vnumber(value);
		// if (core.string.is(value)) return _.startCase(value);
		if (core.boolean.is(value)) return !value ? 'No' : 'Yes';
		return value
	}

}

interface Schema {
	name: string
	icon: string
	defs: SchemaMap[]
}
interface SchemaMap {
	key: keyof Quotes.Quote
	title?: string
}


