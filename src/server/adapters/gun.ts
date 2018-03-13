// 

import * as eyes from 'eyes'
import * as clc from 'cli-color'
import * as _ from 'lodash'
import * as common from '../../common'

import * as Gun from 'gun'



const gun = new Gun({ localStorage: false }).get('idk-face')
export default gun

// process.dtsgen('Gun', Gun)







