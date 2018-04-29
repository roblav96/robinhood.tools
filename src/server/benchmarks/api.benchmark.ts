// 

process.env.DEBUGGER = true
import '../main'
import * as clc from 'cli-color'
import * as execa from 'execa'
import * as onexit from 'exit-hook'
import * as net from 'turbo-net'
import * as http from 'turbo-http'
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
		// await run('http://localhost:8080')
		// await run('http://localhost:12300')
		// await run('http://localhost:12300/api/hello')
		await run('http://dev.robinhood.tools/api/hello')
	}).catch(function(error: Error & execa.ExecaReturns) {
		console.error(`'${error.cmd}' ->`, error)
	}).finally(function() {
		console.log('done')
		process.emit('SIGTERM')
		// process.exit(0)
	})
}



const BUFFER = Buffer.from(JSON.stringify({ hello: 'world' }))
onexit(function onexit() { server.close() })

const server = http.createServer(function handler(req, res) {
	res.setHeader('Content-Length', BUFFER.length)
	res.write(BUFFER)
})
server.listen(8080, 'localhost', start)








// const server = net.createServer(function handler(socket) {
// 	console.log('socket ->', socket)
// })

// server.on('close', function() {
// 	console.warn('server.on -> close')
// })
// server.on('error', function(error) {
// 	console.error('server.on Error ->', error)
// })

// server.listen(8080, 'localhost', start)

// function read(socket, read, cb) {
// 	const buf = Buffer.alloc(read)
// 	socket.read(buf, function(err, next, n) {
// 		if (err) return cb(err)
// 		read -= n
// 		if (!read) return cb(null, buf)
// 		socket.read(next.slice(n), cb)
// 	})
// }






