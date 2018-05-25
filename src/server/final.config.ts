// 

import './main'
import * as _ from 'lodash'
import * as os from 'os'
import * as path from 'path'
import * as pkgup from 'pkg-up'
import * as final from 'final-pm'



const applications = [] as final.Application[]
process.env.NODE_ENV = process.env.NODE_ENV || 'development'
const DEVELOPMENT = process.env.NODE_ENV == 'development'
const PROJECT = path.dirname(pkgup.sync())
const PACKAGE = require(path.join(PROJECT, 'package.json'))

const env = {
	NODE_ENV: process.env.NODE_ENV,
	PROJECT, NAME: PACKAGE.name, VERSION: PACKAGE.version,
	DOMAIN: (DEVELOPMENT ? 'dev.' : '') + PACKAGE.domain,
	SCALE: 1, ORDER: -1,
	DEBUGGER: DEVELOPMENT,
	HOST: '127.0.0.1', PORT: 12300,
} as NodeJS.ProcessEnv

const app = {
	'env': env,
	'instances': 1,
	'mode': 'fork',
	'ready-on': 'message',
	'node-args': ['--no-warnings', '--expose-gc', '--max_old_space_size=2048'],
	// 'logger': 'idk-logger',
	// 'logger-args': ['dont', 'log', '...'],
	// 'stop-signal': 'disconnect',
} as final.Application

// env.DEBUGGER = false



{

	Application({ name: 'api-service', run: 'api/api.js', instances: 2 })

	Application({ name: 'symbols-service', run: 'services/symbols.service', env: { SCALE: 1 } })
	Application({ name: 'search-service', run: 'services/search.service', env: { SCALE: 1 } })
	Application({ name: 'hours-service', run: 'services/hours.service', env: { SCALE: 1 } })
	Application({ name: 'robinhood-service', run: 'services/robinhood.service', env: { SCALE: 1 } })

	let instances = os.cpus().length
	instances = 1
	Application({ name: 'stocks-service', run: 'services/quotes.service', env: { SYMBOLS: 'STOCKS' }, instances })
	Application({ name: 'forex-service', run: 'services/quotes.service', env: { SYMBOLS: 'FOREX' } })
	Application({ name: 'indexes-service', run: 'services/quotes.service', env: { SYMBOLS: 'INDEXES' } })

}



function Application(application: Partial<final.Application>) {
	env.ORDER++; _.defaults(application, app)
	application.env.SCALE = application.instances
	application.mode = application.instances > 1 ? 'cluster' : 'fork'
	applications.push(application as any)
}

let apps = JSON.stringify(applications.map((v, i) => {
	let app = {
		index: i, name: v.name, instances: v.instances,
	} as Partial<final.Application>
	v.env.APPLICATION = JSON.stringify(app)
	return app
}))
applications.forEach(v => v.env.APPLICATIONS = apps)
console.log('applications ->', applications)



module.exports = { applications }


