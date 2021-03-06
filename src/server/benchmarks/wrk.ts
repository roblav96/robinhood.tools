//
// https://github.com/sidorares/node-wrk
//

import * as _ from '../../common/lodash'

export interface Results {
	duration: string
	requests: {
		avg: string
		max: string
		pStdev: number
		rate: number
		stdev: string
		total: number
	}
	transfer: { rate: string; total: string }
	latency: {
		avg: string
		max: string
		p50: string
		p75: string
		p90: string
		p99: string
		pStdev: number
		stdev: string
	}
	errors: { non2xx3xx: number; connect: number; read: number; write: number; timeout: number }
}

export function parse(stdout: string) {
	stdout += '\n'
	let lines = stdout.split('\n')
	let result = {
		requests: {},
		transfer: {},
		latency: {},
		errors: {},
	} as Results
	result.requests.rate = Number.parseFloat(lines[lines.length - 3].split(':')[1].trim())
	result.transfer.rate = lines[lines.length - 2].split(':')[1].trim()
	let errors = 0
	for (let i = 0; i < lines.length; i++) {
		if (parseErrors(lines[i], result)) {
			errors++
		}
	}
	let m = lines[lines.length - 4 - errors].match(
		/(\d+) requests in ([0-9\.]+[A-Za-z]+), ([0-9\.]+[A-Za]+)/,
	)
	result.requests.total = Number.parseFloat(m[1])
	result.duration = m[2]
	result.transfer.total = m[3]
	let latency = lines[3].split(/[\t ]+/)
	result.latency.avg = latency[2]
	result.latency.stdev = latency[3]
	result.latency.max = latency[4]
	result.latency.pStdev = Number.parseFloat(latency[5].slice(0, -1))
	let requests = lines[4].split(/[\t ]+/)
	result.requests.avg = requests[2]
	result.requests.stdev = requests[3]
	result.requests.max = requests[4]
	result.requests.pStdev = Number.parseFloat(requests[5].slice(0, -1))
	if (lines[5].match(/Latency Distribution/)) {
		result.latency.p50 = lines[6].split(/[\t ]+/)[2]
		result.latency.p75 = lines[7].split(/[\t ]+/)[2]
		result.latency.p90 = lines[8].split(/[\t ]+/)[2]
		result.latency.p99 = lines[9].split(/[\t ]+/)[2]
	}
	Object.keys(result.latency).forEach(function (key) {
		let value = result.latency[key]
		if (value.includes && value.includes('us')) {
			result.latency[key] = _.round(Number.parseFloat(value) * 0.001, 3) + 'ms'
		}
	})
	result.errors.non2xx3xx = result.errors.non2xx3xx || 0
	return result
}

function parseErrors(line: string, result: Results) {
	let errors = /Socket errors: connect (\d+), read (\d+), write (\d+), timeout (\d+)/
	let match = line.match(errors)
	if (match) {
		result.errors = result.errors || ({} as any)
		result.errors.connect = Number.parseInt(match[1])
		result.errors.read = Number.parseInt(match[2])
		result.errors.write = Number.parseInt(match[3])
		result.errors.timeout = Number.parseInt(match[4])
		return true
	}
	errors = /Non-2xx or 3xx responses: (\d+)/
	match = line.match(errors)
	if (match) {
		result.errors = result.errors || ({} as any)
		result.errors.non2xx3xx = Number.parseInt(match[1])
		return true
	}
}
