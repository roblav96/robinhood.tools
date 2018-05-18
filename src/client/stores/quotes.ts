// 

import store from '@/client/store'
import socket from '@/client/adapters/socket'
import * as http from '@/client/adapters/http'
import * as rkeys from '@/common/rkeys'
import * as lockr from 'lockr'



let state = {} as Dict<Webull.Quote>
store.register('quotes', state)
declare global { namespace Store { interface State { quotes: typeof state } } }




