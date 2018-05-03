// 

import * as Pandora from 'pandora'
import * as Hub from 'pandora-hub'



const hub = Pandora.getHub()
const client = hub.getHubClient()

client.on('gc', function() { global.gc() })



import { memoryUsage } from 'process'
hub.publish({ memoryUsage }, {
	name: 'memory',
}).catch(function(error) {
	console.error('hub.publish Error ->', error)
})





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

