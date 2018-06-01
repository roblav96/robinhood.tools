// 
process.env.NODE_ENV = process.env.NODE_ENV || 'development'
const DEVELOPMENT = process.env.NODE_ENV == 'development'
const PRODUCTION = process.env.NODE_ENV == 'production'
// 

const webpack = require('webpack')
const path = require('path')
const _ = require('lodash')
const dotenv = require('dotenv')
const package = require('./package.json')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin



module.exports = {

	outputDir: 'dist/client',
	runtimeCompiler: true,

	configureWebpack: function(config) {
		// console.log('configureWebpack config ->', config)

		config.output.filename = '[name].bundle.js'
		config.output.chunkFilename = '[name].chunk.js'

		if (DEVELOPMENT) {
			config.plugins.push(new webpack.WatchIgnorePlugin([/node_modules/, /dist/, /server/, /assets/, /public/, /config/, /env/]))
			config.module.rules.filter(rule => Array.isArray(rule.use)).forEach(function(rule) {
				rule.use.filter(use => use.loader == 'url-loader').forEach(function(use) {
					use.loader = 'file-loader'
					delete use.options.limit
				})
			})
		}

		// config.plugins.push(new webpack.DllReferencePlugin({
		// 	context: __dirname,
		// 	manifest: require(path.resolve(__dirname, 'dist/client/vendors.json'))
		// }))

		// config.plugins.push(new BundleAnalyzerPlugin())

	},

	chainWebpack: function(config) {
		// console.log('chainWebpack config ->', config)

		let main = path.resolve(__dirname, 'src/client/main.ts')
		config.entry('app').clear().add(main)

		config.plugin('define').tap(function(args) {
			args[0]['process.env'].CLIENT = `"${true}"`
			args[0]['process.env'][process.env.NODE_ENV.toUpperCase()] = `"${true}"`
			args[0]['process.env'].NAME = `"${package.name}"`
			args[0]['process.env'].VERSION = `"${package.version}"`
			args[0]['process.env'].DOMAIN = `"${(DEVELOPMENT ? 'dev.' : '') + package.domain}"`
			let env = dotenv.config({ path: path.resolve(__dirname, 'env/client.env') }).parsed || {}
			Object.assign(env, dotenv.config({ path: path.resolve(__dirname, 'env/client.' + process.env.NODE_ENV + '.env') }).parsed || {})
			Object.keys(env).forEach(k => args[0]['process.env'][k] = `"${env[k]}"`)
			return args
		})

		config.plugin('fork-ts-checker').tap(function(args) {
			args[0].tsconfig = '.client.tsconfig.json'
			return args
		})

		config.plugins.delete('no-emit-on-errors')

		// config.plugin('friendly-errors').tap(function(args) {
		// 	args[0].clearConsole = false
		// 	return args
		// })

	},

}



// const inspector = require('inspector')
// inspector.open(+process.debugPort - 1)
// console.clear()
// require('exit-hook')(inspector.close)


