// 

import * as final from 'final-pm'
import * as _ from 'lodash'
import * as os from 'os'



process.env.NODE_ENV = process.env.NODE_ENV || 'development'
const DEVELOPMENT = process.env.NODE_ENV == 'development'

declare global { namespace NodeJS { interface ProcessEnv { HOST: any; PORT: any } } }
const applications = [] as final.Application[]
const app = {
	'env': {
		NODE_ENV: process.env.NODE_ENV,
		HOST: '127.0.0.1', PORT: 12300,
	},
	'instances': 1,
	'mode': 'fork',
	'ready-on': 'message',
	'node-args': ['--no-warnings', '--expose-gc', '--max_old_space_size=2048'],
	// 'logger': 'idk-logger',
	// 'logger-args': ['dont', 'log', '...'],
	// 'stop-signal': 'disconnect',
} as final.Application

if (DEVELOPMENT) app.env.DEBUGGER = true;



{

	Application({ name: 'main', run: 'main', instances: 1 })
	// Application({ name: 'api', run: 'api/api', instances: 2 })

	// Application({ name: 'symbols-service', run: 'services/symbols.service', env: { SCALE: 1 } })
	// Application({ name: 'search-service', run: 'services/search.service', env: { SCALE: 1 } })
	// Application({ name: 'hours-service', run: 'services/hours.service', env: { SCALE: 1 } })
	// Application({ name: 'robinhood-service', run: 'services/robinhood.service', env: { SCALE: 1 } })

	// let instances = os.cpus().length
	// Application({ name: 'stocks-service', run: 'services/quotes.service', env: { SYMBOLS: 'STOCKS' }, instances })
	// Application({ name: 'forex-service', run: 'services/quotes.service', env: { SYMBOLS: 'FOREX' } })
	// Application({ name: 'indexes-service', run: 'services/quotes.service', env: { SYMBOLS: 'INDEXES' } })

}



function Application(application: Partial<final.Application>) {
	_.defaults(application, app)
	application.mode = application.instances > 1 ? 'cluster' : 'fork'
	application.run += '.js'
	applications.push(application as any)
}

declare global { namespace NodeJS { interface ProcessEnv { APPLICATION: any; APPLICATIONS: any } } }
let apps = JSON.stringify(applications.map((v, i) => {
	let app = {
		index: i, name: v.name, instances: v.instances,
	} as Partial<final.Application>
	v.env.APPLICATION = JSON.stringify(app)
	return app
}))
applications.forEach(v => v.env.APPLICATIONS = apps)
// console.log(`applications ->`, JSON.stringify(applications, null, 4))

module.exports = { applications }




