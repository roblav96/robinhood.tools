// 

import * as Pandora from 'pandora'
import Default from 'pandora/dist/default'



export default {
	actuator: {
		http: {
			enabled: false, port: 7004,
		},
	},
	// reporter: {
	// 	file: {
	// 		enabled: false,
	// 	},
	// },
	// logger: {
	// 	logsDir: './logs',
	// 	appLogger: {
	// 		stdoutLevel: 'NONE',
	// 		level: 'NONE',
	// 	},
	// },
} as typeof Default


