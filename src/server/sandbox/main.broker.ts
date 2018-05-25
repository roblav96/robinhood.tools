// 

import '../main'
import * as moleculer from 'moleculer'
import * as Mts from 'moleculer-decorators'



const broker = new moleculer.ServiceBroker({
	nodeID: 'main.brokers',
	logger: true,
	logLevel: 'debug',
	logFormatter: (level, args, bindings) => `🔹 ${args.join(' ')}`,
})
console.log(`brokers ->`, broker)

@Mts.Service({
	name: 'MainBrokerService',
	settings: {
		silent: true,
	},
})
class MainBrokerService extends Mts.BaseSchema {
	created() {
		console.log(`MainBrokerService -> createds`)
	}
}
module.exports = MainBrokerService

// broker.createService(MainBrokerService)
// broker.start()


