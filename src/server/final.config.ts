// 

import * as final from 'final-pm'
import * as _ from 'lodash'
import * as path from 'path'
import * as os from 'os'



process.env.NODE_ENV = process.env.NODE_ENV || 'development'
const DEVELOPMENT = process.env.NODE_ENV == 'development'

const cpus = os.cpus().length
const applications = [] as final.Application[]
const app = {
	'env': {
		NODE_ENV: process.env.NODE_ENV,
		HOST: '127.0.0.1', PORT: 12300,
	},
	'instances': 1,
	'mode': 'fork',
	'ready-on': 'instant',
	'restart-crashing-delay': 3000,
	'node-args': ['--no-warnings', '--expose-gc', '--max_old_space_size=2048'],
} as final.Application
declare global { namespace NodeJS { interface ProcessEnv { HOST: any; PORT: any } } }



if (DEVELOPMENT) app.env.DEBUGGER = true;

let instances = cpus
{
	Application({ name: 'radio', run: 'services/radio.service' })

	if (DEVELOPMENT) instances = 2;
	Application({ name: 'api', run: 'api/api', instances })

	Application({ name: 'symbols', run: 'services/symbols.service' })
	Application({ name: 'search', run: 'services/search.service' })
	Application({ name: 'hours', run: 'services/hours.service' })
	// Application({ name: 'robinhood', run: 'services/robinhood.service' })

	instances = cpus
	if (DEVELOPMENT) instances = 1;
	Application({ name: 'stocks', run: 'services/quotes.service', env: { SYMBOLS: 'STOCKS' }, instances })
	Application({ name: 'forex', run: 'services/quotes.service', env: { SYMBOLS: 'FOREX' } })
	Application({ name: 'indexes', run: 'services/quotes.service', env: { SYMBOLS: 'INDEXES' } })

}



function Application(application: Partial<final.Application>) {
	_.defaults(application.env, app.env)
	_.defaults(application, app)
	application.run = path.resolve(__dirname, `${application.run}.js`)
	applications.push(JSON.parse(JSON.stringify(application)))
}

let total = 0
let envs = JSON.stringify(applications.map((v, i) => {
	let env = {
		NAME: v.name,
		SCALE: v.instances,
		OFFSET: total,
		LENGTH: applications.length,
	} as NodeJS.ProcessEnv
	total += v.instances
	Object.assign(v.env, env)
	return env
}))
declare global { namespace NodeJS { interface ProcessEnv { NAME: string; SCALE: any; OFFSET: any; LENGTH: any; TOTAL: any; ENVS: any; FINAL_PM_INSTANCE_NUMBER: any } } }

applications.forEach(v => {
	v.env.TOTAL = total
	v.env.ENVS = envs
})
// console.log(`applications ->`, JSON.stringify(applications, null, 4))

module.exports = { applications } as final.Configuration


