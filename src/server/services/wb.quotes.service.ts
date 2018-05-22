// 

import '../main'
import * as core from '../../common/core'
import * as rkeys from '../../common/rkeys'
import * as qservice from './quotes.service'



qservice.override.coms = v => ([
	['hgetall', `${rkeys.RH.INSTRUMENTS}:${v}`],
	['hgetall', `${rkeys.YH.QUOTES}:${v}`],
	['hgetall', `${rkeys.IEX.BATCH}:${v}`],
	['hgetall', `${rkeys.WB.TICKERS}:${v}`],
	['hgetall', `${rkeys.WB.QUOTES}:${v}`],
	['hgetall', `${rkeys.QUOTES}:${v}`],
])




