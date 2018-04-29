// 

import chalk from 'chalk'
import * as execa from 'execa'
import * as onexit from 'exit-hook'
import * as url from 'url'
import * as http from 'http'
import * as turbo from 'turbo-http'
import * as Polka from 'polka'
import * as pAll from 'p-all'
import * as Table from 'cli-table2'
import * as core from '../../common/core'
import * as pretty from '../../common/pretty'
import * as wrk from './wrk'



async function run(url: string) {
	console.log('run ->', url)
	let cli = await execa('wrk', ['-t4', '-c100', '-d1s', url])
	// console.log(cli.stdout)
	return wrk.parse(cli.stdout)
}

async function start() {

	let urls = []
	// core.array.create(+process.env.INSTANCES).forEach(function(i) {
	// 	if (i == 0) return;
	// 	urls.push(`http://${process.env.HOST}:${+process.env.IPORT + i}`)
	// })
	// urls.push(`http://${process.env.HOST}:${process.env.PORT}`)
	// urls.push(`http://localhost:8080`)
	urls.push(`http://${process.env.HOST}:${+process.env.IPORT + 1}`)
	urls.push(`http://${process.env.HOST}:${process.env.PORT}/api/hello`)
	urls.push(`http://${process.env.DOMAIN}/api/hello`)

	let results = await pAll(urls.map(v => () => run(v)), { concurrency: 1 })

	let table = new Table({
		head: ['Address', 'Req/sec', 'Data/sec', 'Latency', 'Stdev', '+/- Stdev', 'Dropped'],
		colAligns: ['left', 'right', 'right', 'right', 'right', 'right', 'right', 'right'],
		style: { head: ['bold', 'blue'] },
	}) as string[][]

	results.forEach(function(v, i) {
		let parsed = url.parse(urls[i])
		let dropped = pretty.formatNumber(v.errors.non2xx3xx) + '/' + pretty.formatNumber(v.requests.total)
		table.push([
			parsed.host.concat(parsed.path),
			pretty.formatNumber(v.requests.rate),
			pretty.formatNumber(v.transfer.rate, 2),
			pretty.formatNumber(v.latency.avg, 2),
			pretty.formatNumber(v.latency.stdev, 2),
			pretty.formatNumber(v.latency.pStdev, 2) + '%',
			v.errors.non2xx3xx ? chalk.bold.red(dropped) : dropped,
		])
	})

	process.stdout.write('\r\n' + table.toString() + '\r\n\r\n')

}



const polka = Polka()
polka.get('/', function get(req: any, res: any) { res.end() })

// const server = http.createServer(polka.handler as any)
const server = turbo.createServer(polka.handler as any)
server.listen(+process.env.IPORT, process.env.HOST, function onlisten() {
	console.info('listening ->', process.env.HOST + ':' + process.env.IPORT)
	if (process.env.PRIMARY) {
		start().catch(error => console.error(`'${error.cmd}' ->`, error))
	}
})
onexit(function close() {
	if (Array.isArray(server.connections)) server.connections.forEach(v => v.close());
	server.close()
})


