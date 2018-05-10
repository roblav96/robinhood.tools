// 

import * as pandora from 'pandora'



export function publish(fn: Function) {
	return pandora.getHub().publish({ [fn.name]: fn }, {
		name: fn.name,
	})
}
export async function proxy(name: string) {
	return (await pandora.getHub().getProxy({ name }))[name]
}
// example:
// pandora.publish(readySymbols)
// declare global { namespace Pandora { type readySymbols = typeof readySymbols } }
// let readySymbols = await pandora.proxy('readySymbols') as Pandora.readySymbols
// await readySymbols(process.env.SYMBOLS)



export function send(selector: Hub.Selector, action: string, data = {} as any) {
	pandora.getHub().hubClient.send(selector, action, { data })
}
export function broadcast(selector: Hub.Selector, action: string, data = {} as any) {
	pandora.getHub().hubClient.multipleSend(selector, action, { data })
}

export function once(action: string, fn: (hubmsg: Pandora.HubMessage) => void) {
	pandora.getHub().hubClient.once(action, fn)
}
export function on(action: string, fn: (hubmsg: Pandora.HubMessage) => void) {
	pandora.getHub().hubClient.on(action, fn)
}
export function off(action: string, fn: (hubmsg: Pandora.HubMessage) => void) {
	pandora.getHub().hubClient.removeListener(action, fn)
}





import * as Hub from 'pandora-hub'
declare global {
	namespace Pandora {
		interface HubMessage<T = any> extends Hub.HubMessage {
			data: T
		}
	}
}





// Pandora.processContext.context.serviceReconciler.state = Pandora.State.complete
// let cl = Pandora.consoleLogger.get('console')
// cl.options.level = 0
// cl.options.stderrLevel = 0
// cl.options.json = true
// console.log('cl ->', cl)





// import * as exithook from 'exit-hook'
// exithook(function() {
// 	Pandora.clearCliExit(143)
// })





// const hub = Pandora.getHub()
// const client = hub.getHubClient()

// client.on('gc', function() { global.gc() })

// import { memoryUsage } from 'process'
// hub.publish({ memoryUsage }, {
// 	name: 'memory',
// }).catch(function(error) {
// 	console.error('hub.publish Error ->', error)
// })





// let client = hub.getHubClient()
// client.on('action', function (data) {
// 	client.publish
// })


// pandora.getHub().publish(mem, { name: 'mem' }).then(function(proxy) {
// 	console.log('proxy ->', proxy)
// }).catch(function(error) {
// 	console.error('getProxy Error ->', error)
// })

// let hub = pandora.getHub()
// console.log('hub ->', hub)

// hub.hubClient.invoke({})

// pandora.getProxy({

// }).then(function(proxy) {
// 	console.log('proxy ->', proxy)
// }).catch(function(error) {
// 	console.error('getProxy Error ->', error)
// })

