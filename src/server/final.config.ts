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

	Application({ name: 'main1', run: 'main', instances: 2 })
	Application({ name: 'main2', run: 'main', instances: 1 })
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
	application.mode = application.instances > 1 ? 'cluster' : 'fork'
	application.run += '.js'
	applications.push(JSON.parse(JSON.stringify(application)))
}

declare global {
	interface Representation { offset: number; name: string; scale: number }
	namespace NodeJS { interface ProcessEnv { REPRESENTATION: any; REPRESENTATIONS: any } }
}
let reps = JSON.stringify(applications.map((v, i) => {
	let rep = { offset: i, name: v.name, scale: v.instances } as Representation
	v.env.REPRESENTATION = JSON.stringify(rep)
	return rep
}))
applications.forEach(v => v.env.REPRESENTATIONS = reps)
console.log(`applications ->`, JSON.stringify(applications, null, 4))

module.exports = { applications }




