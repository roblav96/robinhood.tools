// 

import * as forge from 'node-forge'



export function hash256(value: string): string {
	let md = forge.md.sha512.sha256.create()
	md.update(value)
	return md.digest().toHex()
}

export function hmac256(message: string, prime: string): string {
	let hmac = forge.hmac.create()
	hmac.start('sha256', prime)
	hmac.update(message)
	return hmac.digest().toHex()
}

export function randomBytes(size: number): string {
	return forge.util.bytesToHex(forge.random.getBytesSync(Math.round(size * 0.5)))
}

export function generateProbablePrime(size: number): Promise<string> {
	return new Promise<string>(function(resolve, reject) {
		forge.prime.generateProbablePrime((size * 4), function(error, result) {
			if (error) return reject(error);
			resolve(result.toString(16))
		})
	})
}

export function generatePemKeyPair(size: number): Promise<Security.PemKeyPair> {
	return new Promise(function(resolve, reject) {
		let opts = { bits: size, workers: -1 } as any
		forge.pki.rsa.generateKeyPair(opts, function(error, keypair) {
			if (error) return reject(error);
			resolve(keypair)
		})
	}).then(function(keypair: forge.pki.KeyPair) {
		return Promise.resolve({
			publicPem: forge.pki.publicKeyToPem(keypair.publicKey),
			privatePem: forge.pki.privateKeyToPem(keypair.privateKey),
		} as Security.PemKeyPair)
	})
}

export function encryptObjectValues<T = any>(decrypted: T, publicPem: string): T {
	let publicKey = forge.pki.publicKeyFromPem(publicPem)
	let encrypted = {} as T
	Object.keys(decrypted).forEach(function(key) {
		let value = decrypted[key]
		if (value == null) return;
		encrypted[key] = publicKey.encrypt(value)
	})
	return encrypted
}

export function decryptObjectValues<T = any>(encrypted: T, privatePem: string): T {
	let privateKey = forge.pki.privateKeyFromPem(privatePem)
	let decrypted = {} as T
	Object.keys(encrypted).forEach(function(key) {
		let value = encrypted[key]
		if (value == null) return;
		decrypted[key] = privateKey.decrypt(value)
	})
	return decrypted
}





declare global {
	namespace Security {
		interface PemKeyPair {
			publicPem: string
			privatePem: string
		}
	}
}


