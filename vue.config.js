// 

process.env.NODE_ENV = process.env.NODE_ENV || 'development'
const DEVELOPMENT = process.env.NODE_ENV == 'development'
const PRODUCTION = process.env.NODE_ENV == 'production'

let DEBUG = false
if (PRODUCTION) DEBUG = false;
if (DEBUG) {
	const inspector = require('inspector')
	inspector.open(+process.debugPort - 1)
	console.clear()
	require('exit-hook')(inspector.close)
}

const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const dotenv = require('dotenv')
const webpack = require('webpack')
const package = require('./package.json')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin



module.exports = {

	outputDir: 'dist/client',
	runtimeCompiler: true,

	configureWebpack: function(config) {
		if (DEBUG) console.log('configure config ->', config);

		config.output.filename = '[name].bundle.js'
		config.output.chunkFilename = '[name].chunk.js'

		process.env.VUE_APP_DLL = ''
		if (DEVELOPMENT) {
			process.env.VUE_APP_DLL = `<script src='/vendors.dll.js'></script>`
			config.plugins.push(new webpack.WatchIgnorePlugin([/node_modules/, /dist/, /server/, /assets/, /public/, /env/]))
			config.module.rules.filter(rule => Array.isArray(rule.use)).forEach(function(rule) {
				rule.use.filter(use => use.loader == 'url-loader').forEach(function(use) {
					use.loader = 'file-loader'
					delete use.options.limit
				})
			})
			let manifest = path.resolve(__dirname, 'public/vendors.json')
			if (fs.existsSync(manifest)) {
				config.plugins.push(new webpack.DllReferencePlugin({
					context: __dirname,
					manifest: require(manifest),
				}))
			}
		}

		// config.plugins.push(new BundleAnalyzerPlugin())

	},

	chainWebpack: function(config) {
		if (DEBUG) console.log('chain config ->', config);

		let main = path.resolve(__dirname, 'src/client/main.ts')
		config.entry('app').clear().add(main)
		config.resolve.alias.store.delete('@')

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


