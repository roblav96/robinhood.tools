// 
import './adapters/console'
global.Promise = require('bluebird')
Promise.config({ warnings: { wForgottenReturn: false } })
// 

import * as execa from 'execa'
import * as onexit from 'exit-hook'
import * as turbo from 'turbo-http'
import * as getstream from 'get-stream'
import * as pAll from 'p-all'



async function run(url: string) {
	// process.stdout.write('\r\n')
	console.log('run url ->', url)
	let cli = execa('wrk', ['-t1', '-c100', '-d1s', url])
	// let cli = execa('bombardier', ['-c100', '-d1s', url])
	cli.stdout.pipe(process.stdout)
	cli.stderr.pipe(process.stderr)
	// getstream(cli.stdout).then(value => console.log('child output ->', value))

	let results = await cli
	// console.log('results ->', results)

}

function start() {
	return Promise.resolve().then(async function() {
		await run('http://localhost:8080')
		await run('http://localhost:12300')
		await run('http://localhost:12300/api/hello')
		await run('http://dev.robinhood.tools/api/hello')
	}).catch(function(error: Error & execa.ExecaReturns) {
		console.error(`'${error.cmd}' ->`, error)
	}).finally(function() {
		console.info('done')
		process.exit(0)
	})
}

const server = turbo.createServer(function handler(req, res) {
	let buffer = Buffer.from(JSON.stringify({ hello: 'world' }))
	res.setHeader('Content-Length', buffer.length)
	res.write(buffer)
})
server.listen(8080, 'localhost', start)
onexit(function onexit() { server.close() })


