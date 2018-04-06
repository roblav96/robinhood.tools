// 

import * as fs from 'fs'
import * as path from 'path'
import * as sourcemaps from 'source-map-support'



/**▶ utils.requireDir(__dirname, __filename) */
export function requireDir(dirName: string, fileName: string) {
	fs.readdirSync(dirName).filter(v => v != fileName).forEach(function(file) {
		let full = path.join(dirName, file)
		let src = sourcemaps.retrieveSourceMap(full).url
		src = src.replace('/dist/', '/src/').replace('.js', '.ts')
		if (!fs.existsSync(src)) return;
		require(full)
	})
}




