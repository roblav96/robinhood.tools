// 

import polka from './polka'



import * as cors from 'cors'
polka.use(cors({ origin: process.env.DOMAIN }))



import * as cookie from 'cookie'






