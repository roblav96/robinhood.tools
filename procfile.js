// 

const _ = require('lodash')



module.exports = (pandora) => {

	console.log('this ->', this)

	pandora
		.entry('./dist/server/main.js')

	pandora
		.cluster('./dist/server/main.js')

	// pandora
	// 	.process('worker')
	// 	.scale('auto')
	// 	.env({
	// 		"NODE_ENV": "development",
	// 	})

	console.log('pandora ->', pandora)





	// /** 
	// * you can custom workers scale number
	// */
	// // pandora
	// //   .process('worker')
	// //   .scale(2); // .scale('auto') means os.cpus().length

	// /**
	//  * you can also use fork mode to start application 
	//  */
	// // pandora
	// //   .fork('robinhood.tools', './blank');

	// /**
	//  * you can create another process here
	//  */
	// // pandora
	// //   .process('background')
	// //   .nodeArgs(['--expose-gc']);

	// /**
	//  * more features please visit our document.
	//  * https://github.com/midwayjs/pandora/
	//  */

}



const util = require('util')
_.merge(util.inspect, {
	defaultOptions: {
		showHidden: true,
		showProxy: true,
		depth: 8,
		compact: false,
		breakLength: Infinity,
		maxArrayLength: Infinity,
		colors: true,
	},
	styles: {
		string: 'green', regexp: 'green', date: 'green',
		number: 'magenta', boolean: 'blue',
		undefined: 'red', null: 'red',
		symbol: 'cyan', special: 'cyan',
	},
})


