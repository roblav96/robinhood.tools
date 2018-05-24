// 

process.env.DEBUGGER = true

import '../main'
// import * as finalpm from 'final-pm'

import * as appconfig from 'final-pm/config/default-application-config'
console.warn(`dtsgen appconfig ->`, console.dtsgen(appconfig))
import * as config from 'final-pm/config/default-config'
console.warn(`dtsgen config ->`, console.dtsgen(config))

// console.log(`finalpm.config ->`, finalpm.config)
// console.warn(`dtsgen finalpm.config ->`, console.dtsgen(finalpm.config))

// finalpm.config.getConfig().then( function (response) {
// 	console.log(`response ->`, response)
// } ).catch(function(error) {
// 	console.error(`catch Error -> %O`, error)
// })


