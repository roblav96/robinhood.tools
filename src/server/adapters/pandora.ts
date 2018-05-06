// 

import * as exithook from 'exit-hook'
import * as Pandora from 'pandora'
import * as Hub from 'pandora-hub'



export const hub = Pandora.getHub()
export const client = hub.getHubClient()

export function broadcast(selector: Hub.Selector, action: string, data?: any) {
	client.multipleSend(selector, action, { data })
}

export function on(action: string, fn: (message: Hub.HubMessage) => void) {
	client.on(action, fn)
}

exithook(function() {
	Pandora.clearCliExit(1)
})



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

