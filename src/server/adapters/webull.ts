// 

import * as util from 'util'
import * as _ from '../../common/lodash'
import * as core from '../../common/core'

import * as got from 'got'
import * as qs from 'querystring'
import * as redis from './redis'



const DID = process.env.WEBULL_DID
const TOKEN = process.env.WEBULL_TOKEN



export async function search(query: string) {
	return got.get('https://infoapi.webull.com/api/search/tickers2', {
		query: { keys: query },
		json: true,
	}).then(function({ body }) {
		return body
	})
}


