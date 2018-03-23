// 

import * as eyes from 'eyes'
import * as _ from 'lodash'
import * as core from '../../common/core'
import * as utils from '../services/utils'

import * as WebSocket from 'uws'
import fastify from '../fastify'



const wss = new WebSocket.Server({
	host: 'localhost',
	port: process.PORT,
	path: 'ws',
})

export default wss








