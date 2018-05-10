// 

import '../main'

import './polka'
import './polka.request'
import './polka.response'

import './cors.hook'
import './security.hook'
import './validator.hook'

import * as utils from '../adapters/utils'
utils.requireDir(__dirname, __filename, v => v.endsWith('.api.ts'))


