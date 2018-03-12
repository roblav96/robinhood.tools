// 

import * as forge from 'node-forge'

declare module 'node-forge' {
	
	// const md: any
	const hmac: any
	const random: any
	const prime: any

	namespace md {
		namespace sha512 {
			function create(): MessageDigest;
		}
	}
	
	namespace pki {
		function privateKeyFromPem(pem: PEM): Key
	}

}


