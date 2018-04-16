// 

import * as Buffer from 'buffer'
import * as msgpack5 from 'msgpack5'

import bl from 'bl'
const BufferList = require('bl') as typeof bl



const msgpack = msgpack5()
export const { encode, decode } = msgpack

const encoder = msgpack.encoder()
const decoder = msgpack.decoder()
export { encoder, decoder }

// export function encode(value: any) {
// 	return msgpack.encode(value).toString()
// }

// export {decode} from 'msgpack5'

// export function decode(value: Buffer): any {
// 	// let buf = new BufferList().append(buf)
// 	return msgpack.decode(value)
// }

