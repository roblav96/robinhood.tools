// 

import * as execa from 'execa'
import * as onexit from 'exit-hook'
import * as url from 'url'
import * as turbo from 'turbo-http'
import * as pAll from 'p-all'
import * as Table from 'cli-table2'
import * as core from '../../common/core'
import * as pretty from '../../common/pretty'
import * as wrk from './wrk'



async function run(url: string) {
	console.log('benchmark ->', url)
	let cli = await execa('wrk', ['-t1', '-c100', '-d3s', url, '--latency'])
	return wrk.parse(cli.stdout)
}

async function start() {

	let descs = [
		'Barebones Turbo HTTP',
	]
	let urls = []
	core.array.create(+process.env.INSTANCES).forEach(function(i) {
		if (i == 0) return;
		urls.push(`http://${process.env.HOST}:${+process.env.IPORT + i}`)
	})
	// urls.push(`http://${process.env.HOST}:${process.env.IPORT}`)
	// urls.push(`http://${process.env.HOST}:${process.env.PORT}`)
	urls.push(`http://${process.env.HOST}:${process.env.PORT}/api/hello`)
	urls.push(`http://${process.env.DOMAIN}/api/hello`)

	let results = await pAll(urls.map(v => () => run(v)), { concurrency: 1 })

	let table = new Table({
		// head: ['Description', 'Address', 'Req/sec', 'Data/sec', 'Latency'],
		head: ['Address', 'Req/sec', 'Data/sec', 'Latency'],
		colAligns: ['left', 'left', 'right', 'right', 'right'],
		style: { head: ['bold', 'magenta'] },
	}) as any[]
	results.forEach(function(v, i) {
		let parsed = url.parse(urls[i])
		table.push([
			// descs[i],
			parsed.host.concat(parsed.path),
			pretty.formatNumber(v.requests.rate),
			pretty.formatNumber(v.transfer.rate, 2),
			pretty.formatNumber(v.latency.avg, 2),
		])
	})

	console.info()
	process.stdout.write(table.toString() + '\r\n\r\n')

}



const INSTANCE = +process.env.INSTANCE
const BUFFER = Buffer.from(JSON.stringify({ hello: 'world' }))
const server = turbo.createServer(function handler(req, res) {
	res.end()
})
server.listen(+process.env.IPORT, process.env.HOST, function onlisten() {
	console.info('listening ->', process.env.HOST + ':' + process.env.IPORT)
	if (!process.env.PRIMARY) return;
	start().catch(function(error: Error & execa.ExecaReturns) {
		console.error(`'${error.cmd}' ->`, error)
	})
})
onexit(function close() {
	server.connections.forEach(v => v.close())
	server.close()
})


