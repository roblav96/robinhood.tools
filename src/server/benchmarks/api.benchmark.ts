// 

import * as execa from 'execa'
import * as onexit from 'exit-hook'
import * as turbo from 'turbo-http'
import * as wrk from './wrk'



async function run(url: string) {
	console.log('run ->', url)
	let cli = execa('wrk', ['-t1', '-c100', '-d1s', url, '--latency'])
	cli.stderr.pipe(process.stderr)
	let done = await cli
	let results = wrk.parse(done.stdout)
	console.log('results ->', results)
}

function start() {
	process.stdout.write('\r\n\r\n')
	return Promise.resolve().then(async function() {
		await run(`http://${process.env.HOST}:${process.env.IPORT}`)
		await run(`http://${process.env.HOST}:${process.env.PORT}`)
		await run(`http://${process.env.HOST}:${process.env.PORT}/api/hello`)
		await run(`http://${process.env.DOMAIN}/api/hello`)
	}).catch(function(error: Error & execa.ExecaReturns) {
		console.error(`'${error.cmd}' ->`, error)
	}).finally(function() {
		console.log('done')
		// process.emit('SIGTERM')
		// process.exit(0)
	})
}



const BUFFER = Buffer.from(JSON.stringify({ hello: 'world' }))
const server = turbo.createServer(function handler(req, res) {
	res.setHeader('Content-Length', BUFFER.length)
	res.write(BUFFER)
})
server.listen(+process.env.IPORT, process.env.HOST, start)
onexit(function() { server.close() })


