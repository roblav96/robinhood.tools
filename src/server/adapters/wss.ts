// 

import chalk from 'chalk'
import * as eyes from 'eyes'
import * as _ from 'lodash'
import * as common from '../../common'
import * as utils from '../services/utils'

import * as WebSocket from 'uws'
import fastify from '../fastify'



const wss = new WebSocket.Server({
	host: 'localhost',
	port: process.PORT + process.INSTANCE,
	path: 'ws',
})

export default wss








