// 

import * as eyes from 'eyes'
import * as _ from 'lodash'
import * as core from '../../common/core'

import * as uws from 'uws'
import fastify from '../fastify'



const wss = new uws.Server({
	host: 'localhost',
	port: process.PORT,
	path: 'websocket',
})

export default wss








