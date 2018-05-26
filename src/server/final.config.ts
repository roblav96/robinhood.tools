// 

import * as final from 'final-pm'
import * as _ from 'lodash'
import * as os from 'os'



process.env.NODE_ENV = process.env.NODE_ENV || 'development'
const DEVELOPMENT = process.env.NODE_ENV == 'development'

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
	// 'logger': 'idk-logger',
	// 'logger-args': ['dont', 'log', '...'],
	// 'stop-signal': 'disconnect',
} as final.Application
declare global { namespace NodeJS { interface ProcessEnv { HOST: any; PORT: any } } }

if (DEVELOPMENT) app.env.DEBUGGER = true;



{

	// Application({ name: 'main1', run: 'main', instances: 1 })
	// Application({ name: 'main2', run: 'main', instances: 2 })

	Application({ name: 'radio', run: 'services/radio.service' })
	// Application({ name: 'api', run: 'api/api', instances: 2 })

	// Application({ name: 'symbols-service', run: 'services/symbols.service' })
	// Application({ name: 'search-service', run: 'services/search.service' })
	// Application({ name: 'hours-service', run: 'services/hours.service' })
	// Application({ name: 'robinhood-service', run: 'services/robinhood.service' })

	// let instances = os.cpus().length
	// Application({ name: 'stocks-service', run: 'services/quotes.service', env: { SYMBOLS: 'STOCKS' }, instances })
	// Application({ name: 'forex-service', run: 'services/quotes.service', env: { SYMBOLS: 'FOREX' } })
	// Application({ name: 'indexes-service', run: 'services/quotes.service', env: { SYMBOLS: 'INDEXES' } })

}



function Application(application: Partial<final.Application>) {
	_.defaults(application, app)
	// application.mode = application.instances > 1 ? 'cluster' : 'fork'
	application.run += '.js'
	applications.push(JSON.parse(JSON.stringify(application)))
}

let envs = JSON.stringify(applications.map((v, i) => {
	let env = {
		NAME: v.name,
		SCALE: v.instances,
		OFFSET: i,
		LENGTH: applications.length,
	} as final.ProcessEnv
	Object.assign(v.env, env)
	return env
}))
declare global { namespace NodeJS { interface ProcessEnv { NAME: any; SCALE: any; OFFSET: any; LENGTH: any; ENVS: any; FINAL_PM_INSTANCE_NUMBER: any } } }

applications.forEach(v => v.env.ENVS = envs)
// console.log(`applications ->`, JSON.stringify(applications, null, 4))

module.exports = { applications }


