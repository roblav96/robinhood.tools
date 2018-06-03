// 

import * as lockr from 'lockr'
import * as http from '../adapters/http'
import * as rkeys from '../../common/rkeys'
import store from '../store'
import socket from '../adapters/socket'



let state = {} as Dict<Webull.Quote>
store.register('quotes', state)
declare global { namespace Store { interface State { quotes: typeof state } } }








