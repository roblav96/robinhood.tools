// 

import * as fs from 'fs'
import * as path from 'path'
import * as sourcemaps from 'source-map-support'



let filename__ = __filename.split('/').pop()
fs.readdirSync(__dirname).filter(v => v != filename__).forEach(function(file) {
	let full = path.join(__dirname, file)
	let src = sourcemaps.retrieveSourceMap(full).url
	src = src.replace('/dist/', '/src/').replace('.js', '.ts')
	if (fs.existsSync(src)) require(full);
})



