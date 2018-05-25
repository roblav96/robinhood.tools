// 

// process.env.DEBUGGER = true
// import '../main'
import * as moleculer from 'moleculer'
import * as Mts from 'moleculer-decorators'



const broker = new moleculer.ServiceBroker({
	// internalServices:
	// logger: console,
	// logFormatter: (level, args, bindings) => {
	// 	process.stdout.write('level')
	// 	process.stdout.write(level)
	// 	return 'format face' + level
	// },
})

@Mts.Service({
	name: 'servsdsice.ssdname???',
	settings: {
		silent: true,
	},
})
export default class ServiceName extends Mts.BaseSchema {
	created() {
		console.log(`cresdatedsd`)
	}
}

console.log(`process.env ->`, process.env)

// broker.createService(ServiceName)
// broker.start()

// module.exports = ServiceName


