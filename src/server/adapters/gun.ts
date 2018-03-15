// 

import chalk from 'chalk'
import * as eyes from 'eyes'
import * as _ from 'lodash'
import * as common from '../../common'
import * as utils from '../services/utils'

// import 'gun/nts'
import 'gun/lib/uws'
import * as Gun from 'gun/gun'



let stport = process.PORT + process.INSTANCES + 2
let port = stport + process.INSTANCE
let host = 'ws://localhost:' + port + '/websocket'
console.log('host >', host)

if (process.PRIMARY) console.log('host >', host);


