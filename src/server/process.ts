// 

import chalk from 'chalk'
import * as eyes from 'eyes'
import * as util from 'util'
import * as _ from 'lodash'
import * as os from 'os'
import * as cluster from 'cluster'
import * as path from 'path'
import * as dotenv from 'dotenv'
import * as ee4 from '../common/ee4'



global.NODE_ENV = process.env.NODE_ENV || 'development'
global.DEVELOPMENT = NODE_ENV == 'development'
global.PRODUCTION = NODE_ENV == 'production'

process.INSTANCES = os.cpus().length
process.INSTANCE = cluster.isWorker ? Number.parseInt(process.env.WORKER_INSTANCE) : -1
process.PRIMARY = process.INSTANCE == 0
process.MASTER = cluster.isMaster
process.WORKER = cluster.isWorker

dotenv.config({ path: path.resolve(process.cwd(), 'config/server.' + NODE_ENV + '.env') })
dotenv.config({ path: path.resolve(process.cwd(), 'config/server.env') })
process.NAME = process.env.npm_package_name
process.VERSION = process.env.npm_package_version
process.DOMAIN = (DEVELOPMENT ? 'http://dev.' : 'https://') + process.env.npm_package_domain
process.HOST = process.env.HOST || 'localhost'
process.PORT = Number.parseInt(process.env.PORT) || 12300
process.SERVER = true

process.EE4 = new ee4.EventEmitter()



_.merge(util.inspect, {
	defaultOptions: {
		showHidden: true,
		showProxy: true,
		depth: 16,
		colors: true,
		compact: false,
		breakLength: Infinity,
		maxArrayLength: Infinity,
	},
	styles: {
		string: 'green', regexp: 'green', date: 'green',
		number: 'magenta', boolean: 'blue',
		undefined: 'grey', null: 'grey',
		symbol: 'yellow', special: 'cyan',
	},
} as Partial<typeof util.inspect>)



_.merge(eyes.defaults, { styles: { all: 'grey' }, maxLength: 65536, showHidden: true, pretty: true } as eyes.EyesOptions)
const inspector = eyes.inspector(_.defaults({ stream: null } as eyes.EyesOptions, eyes.defaults))
Object.assign(eyes, { stringify(value: any) { return chalk.reset[eyes.defaults.styles.all](inspector(value)) } })



process.once('uncaughtException', function(error) {
	console.error('UNCAUGHT EXCEPTION ->', error)
})
process.once('unhandledRejection', function(error) {
	console.error('UNHANDLED REJECTION ->', error)
	console.log('https://github.com/mcollina/make-promises-safe')
	process.exit(1)
})



if (process.MASTER) {
	console.log(process.NAME)
	console.log(NODE_ENV)
	console.log(process.HOST + ':' + process.PORT)
}


