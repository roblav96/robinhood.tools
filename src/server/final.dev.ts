// 

import * as execa from 'execa'
import * as exithook from 'exit-hook'
import * as final from 'final-pm'
const { applications } = require('./final.config') as final.Configuration



let clis = [] as execa.ExecaChildProcess[]
function spawn(app: final.Application, instance: number) {
	app.env.FINAL_PM_INSTANCE_NUMBER = instance
	let cli = execa('node', app['node-args'].concat(app.run), {
		env: app.env as any,
		extendEnv: false,
		killSignal: 'SIGKILL',
	})
	cli.stdout.pipe(process.stdout)
	cli.stderr.pipe(process.stderr)
	clis.push(cli)
}

let ii = 0
applications.forEach((app, i) => {
	Array.from(Array(app.instances), function(v, instance) {
		setTimeout(spawn, 1 * ii++, app, instance)
	})
})

Promise.all(clis).then(function(resolved) {
	console.log(`clis resolved ->`, resolved)
}).catch(function(error) {
	console.error(`clis Error -> %O`, error)
})

// exithook(function() {
// 	clis.forEach(v => v.kill('SIGKILL'))
// })


