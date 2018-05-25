// 

// import * as pandora from 'pandora'
import * as boom from 'boom'
import * as security from './security'



// export function getClient() {
// 	return pandora.getHub().hubClient
// }

// export function publish(fn: Function) {
// 	return pandora.getHub().publish({ [fn.name]: fn }, {
// 		name: fn.name,
// 	})
// }
// export async function proxy(name: string) {
// 	return (await pandora.getHub().getProxy({ name }))[name]
// }
// // example:
// // pandora.publish(readySymbols)
// // declare global { namespace Pandora { type readySymbols = typeof readySymbols } }
// // let readySymbols = await pandora.proxy('readySymbols') as Pandora.readySymbols
// // await readySymbols(process.env.SYMBOLS)



// export function send(selector: Hub.Selector, action: string, data = {} as any) {
// 	pandora.getHub().hubClient.send(selector, action, { data })
// }
// export function broadcast(selector: Hub.Selector, action: string, data = {} as any) {
// 	pandora.getHub().hubClient.multipleSend(selector, action, { data })
// }

// export function once(action: string, fn: (hubmsg: Pandora.HubMessage) => void) {
// 	pandora.getHub().hubClient.once(action, fn)
// }
// export function on(action: string, fn: (hubmsg: Pandora.HubMessage) => void) {
// 	pandora.getHub().hubClient.on(action, fn)
// }
// export function off(action: string, fn: (hubmsg: Pandora.HubMessage) => void) {
// 	pandora.getHub().hubClient.removeListener(action, fn)
// }

// interface InvokeReplyData {
// 	request: any
// 	response: any
// 	reqId: string
// 	error: Error
// }
// export function reply(action: string, fn: (data: any) => Promise<any>) {
// 	on(action, function oninvoke(hubmsg: Pandora.HubMessage<InvokeReplyData>) {
// 		let reqId = hubmsg.data.reqId
// 		let clientId = hubmsg.host.clientId
// 		return fn(hubmsg.data.request).then(response => {
// 			send({ clientId }, action, { reqId, response } as InvokeReplyData)
// 		}).catch(error => {
// 			send({ clientId }, action, { reqId, error } as InvokeReplyData)
// 		})
// 	})
// }
// export function invoke(selector: Hub.Selector, action: string, data = {} as any) {
// 	let reqId = security.randomBits(16)
// 	let clientId = pandora.getHub().hubClient.getLocation().clientId
// 	return new Promise<any>((resolve, reject) => {
// 		on(action, function onreply(hubmsg: Pandora.HubMessage<InvokeReplyData>) {
// 			if (hubmsg.host.clientId == clientId) return;
// 			if (hubmsg.data.reqId != reqId) return;
// 			off(action, onreply)
// 			hubmsg.data.error ? reject(hubmsg.data.error) : resolve(hubmsg.data.response)
// 		})
// 		send(selector, action, { reqId, request: data } as InvokeReplyData)
// 	})
// }





// import * as Hub from 'pandora-hub'
// declare global {
// 	namespace Pandora {
// 		interface HubMessage<T = any> extends Hub.HubMessage {
// 			data: T
// 		}
// 	}
// }





// // Pandora.processContext.context.serviceReconciler.state = Pandora.State.complete
// // let cl = Pandora.consoleLogger.get('console')
// // cl.options.level = 0
// // cl.options.stderrLevel = 0
// // cl.options.json = true
// // console.log('cl ->', cl)





// // import * as exithook from 'exit-hook'
// // exithook(function() {
// // 	Pandora.clearCliExit(143)
// // })





// // const hub = Pandora.getHub()
// // const client = hub.getHubClient()

// // client.on('gc', function() { global.gc() })

// // import { memoryUsage } from 'process'
// // hub.publish({ memoryUsage }, {
// // 	name: 'memory',
// // }).catch(function(error) {
// // 	console.error('hub.publish Error ->', error)
// // })





// // let client = hub.getHubClient()
// // client.on('action', function (data) {
// // 	client.publish
// // })


// // pandora.getHub().publish(mem, { name: 'mem' }).then(function(proxy) {
// // 	console.log('proxy ->', proxy)
// // }).catch(function(error) {
// // 	console.error('getProxy Error ->', error)
// // })

// // let hub = pandora.getHub()
// // console.log('hub ->', hub)

// // hub.hubClient.invoke({})

// // pandora.getProxy({

// // }).then(function(proxy) {
// // 	console.log('proxy ->', proxy)
// // }).catch(function(error) {
// // 	console.error('getProxy Error ->', error)
// // })

