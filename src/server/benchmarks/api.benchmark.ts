// 

import * as execa from 'execa'
import * as onexit from 'exit-hook'
import * as turbo from 'turbo-http'
import * as pAll from 'p-all'
import * as Table from 'cli-table2'
import * as pretty from '../../common/pretty'
import * as wrk from './wrk'



async function run(url: string) {
	console.log('run ->', url)
	let cli = execa('wrk', ['-t1', '-c100', '-d1s', url, '--latency'])
	cli.stdout.pipe(process.stdout)
	cli.stderr.pipe(process.stderr)
	let results = await cli
	cli.kill('SIGKILL')
	return wrk.parse(results.stdout)
}

async function start() {
	let urls = [
		`http://${process.env.HOST}:${process.env.IPORT}`,
		// `http://${process.env.HOST}:${process.env.PORT}`,
		`http://${process.env.HOST}:${process.env.PORT}/api/hello`,
		// `http://${process.env.DOMAIN}/api/hello`,
	]
	let results = await pAll(urls.map(v => () => run(v)), { concurrency: 1 })
	// console.log('results ->', JSON.stringify(results, null, 4))

	let table = new Table({
		head: ['', 'Url', 'Req/sec', 'Data/sec', 'Latency'],
		colAligns: ['left', 'left', 'right', 'right', 'right'],
		style: { head: [] },
	}) as any[]
	results.forEach(function(v, i) {
		table.push([
			i,
			urls[i].replace('http://', ''),
			pretty.formatNumber(v.requests.rate, 0),
			pretty.formatNumber(v.transfer.rate, 2),
			pretty.formatNumber(v.latency.avg, 2),
		])
	})
	console.info(table.toString())

}



const BUFFER = Buffer.from(JSON.stringify({ hello: 'world' }))
const server = turbo.createServer(function handler(req, res) {
	res.setHeader('Content-Length', BUFFER.length)
	res.write(BUFFER)
})
server.listen(+process.env.IPORT, process.env.HOST, function onlisten() {
	start().catch(function(error: Error & execa.ExecaReturns) {
		console.error(`'${error.cmd}' ->`, error)
	})
})
onexit(function onexit() {
	server.connections.forEach(v => v.close())
	server.close()
})


