//

import * as Vts from 'vue-property-decorator'
import { mixins as Mixins } from 'vue-class-component'
import Vue from 'vue'
import VMixin from '../../mixins/v.mixin'
import Symbol from './symbol'
import * as url from 'url'
import * as dayjs from 'dayjs'
import * as _ from '../../../common/lodash'
import * as core from '../../../common/core'
import * as rkeys from '../../../common/rkeys'
import * as http from '../../../common/http'
import * as utils from '../../adapters/utils'
import * as pretty from '../../adapters/pretty'
import socket from '../../adapters/socket'

@Vts.Component
export default class extends Mixins(VMixin) {
	$parent: Symbol
	symbol = this.$parent.symbol
	all = this.$parent.all

	schemas = [
		{
			name: 'Instrument',
			icon: 'coin',
			defs: [
				{ key: 'name' },
				{ key: 'issueType' },
				{ key: 'country' },
				{ key: 'timezone' },
				{ key: 'currency' },
			],
		},
		{
			name: 'Exchange',
			icon: 'bank',
			defs: [
				{ key: 'exchange', title: 'Name' },
				{ key: 'acronym' },
				{ key: 'listDate' },
				{ key: 'status' },
				{ key: 'statusTimestamp', title: 'Status Updated' },
			],
		},
	] as Schema[]

	vvalue(key: keyof Quotes.Quote) {
		let value = this.all.quote[key]
		if (value == null) return value
		if (key == 'statusTimestamp') return pretty.time(value as any, { verbose: true })
		if (key == 'listDate') return dayjs(value as any).format('MMMM D, YYYY')
		if (core.number.isFinite(value)) return pretty.number(value)
		if (core.boolean.is(value)) return value ? 'Yes' : 'No'
		if (core.string.is(value)) {
			let ikeys = ['timezone', 'status'] as KeysOf<Quotes.Quote>
			if (ikeys.includes(key)) return core.string.capitalize(_.startCase(value))
		}
		return value
	}

	get website() {
		return this.all.quote.website
			? url.parse(this.all.quote.website).host
			: this.all.quote.website
	}

	states = [
		{
			name: '4am to 8pm',
			icon: 'theme-light-dark',
			key: '',
			calc: 'startPrice',
			tip: 'Price at start of day (4:00am)',
		},
		{
			name: 'Pre Market',
			icon: 'weather-sunset-up',
			key: 'pre',
			calc: 'startPrice',
			tip: 'Price at start of day (4:00am)',
		},
		{
			name: 'Regular',
			icon: 'weather-sunny',
			key: 'reg',
			calc: 'openPrice',
			tip: 'Price at market open (9:30am)',
		},
		{
			name: 'After Hours',
			icon: 'weather-sunset-down',
			key: 'post',
			calc: 'closePrice',
			tip: 'Price at market close (4:00pm)',
		},
	]
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
