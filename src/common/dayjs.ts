// 

import Dayjs from 'dayjs'
const dayjs = require('dayjs') as typeof Dayjs



export default function getdayjs(input = Date.now() as any) {
	if (typeof input == 'string') input = new Date(input);
	return dayjs(input)
}


