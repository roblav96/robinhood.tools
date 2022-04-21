//

process.env.NODE_ENV = process.env.NODE_ENV || 'development'
const DEVELOPMENT = process.env.NODE_ENV == 'development'
const PRODUCTION = process.env.NODE_ENV == 'production'

const DEBUG = false

const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const dotenv = require('dotenv')
const webpack = require('webpack')
const package = require('./package.json')
const tailwindcss = require('tailwindcss')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

module.exports = {
	outputDir: 'dist/client',
	runtimeCompiler: true,
	// css: { sourceMap: !!process.env.DEVELOPMENT },

	configureWebpack: function (config) {
		if (DEBUG) console.log('configure config ->', config)

		delete config.node.process

		config.output.filename = '[name].bundle.js'
		config.output.chunkFilename = '[name].chunk.js'

		if (DEVELOPMENT) {
			// config.devtool = 'source-map'
			config.plugins.push(
				new webpack.WatchIgnorePlugin([
					/node_modules/,
					/dist/,
					/server/,
					/assets/,
					/public/,
					/env/,
					/json/,
				]),
			)
			// config.module.rules.filter(rule => Array.isArray(rule.use)).forEach(function(rule) {
			// 	rule.use.filter(use => use.loader == 'url-loader').forEach(function(use) {
			// 		use.loader = 'file-loader'
			// 		delete use.options.limit
			// 	})
			// })
		}

		// config.plugins.push(tailwindcss(path.join(__dirname, 'src/client/styles/tailwind.js')))
		// config.plugins.push(new webpack.ProvidePlugin({ Promise: 'zousan/src/zousan' }))

		// config.plugins.push(new BundleAnalyzerPlugin())
	},

	chainWebpack: function (config) {
		if (DEBUG) console.log('chain config ->', config)

		let main = path.join(__dirname, 'src/client/main.ts')
		config.entry('app').clear().add(main)
		config.resolve.alias.store.delete('@')

		config.plugin('define').tap(function (args) {
			args[0]['process.env'].CLIENT = `"${true}"`
			args[0]['process.env'][process.env.NODE_ENV.toUpperCase()] = `"${true}"`
			args[0]['process.env'].NAME = `"${package.name}"`
			args[0]['process.env'].VERSION = `"${package.version}"`
			args[0]['process.env'].DOMAIN = `"${(DEVELOPMENT ? 'dev.' : '') + package.domain}"`
			let env = dotenv.config({ path: path.join(__dirname, 'env/client.env') }).parsed || {}
			Object.assign(
				env,
				dotenv.config({
					path: path.join(__dirname, 'env/client.' + process.env.NODE_ENV + '.env'),
				}).parsed || {},
			)
			Object.keys(env).forEach((k) => (args[0]['process.env'][k] = `"${env[k]}"`))
			return args
		})

		config.plugin('fork-ts-checker').tap(function (args) {
			args[0].tsconfig = '.client.tsconfig.json'
			args[0].memoryLimit = 4096
			args[0].workers = 2
			return args
		})

		config.plugins.delete('no-emit-on-errors')

		if (PRODUCTION) {
			config.plugin('friendly-errors').tap(function (args) {
				args[0].clearConsole = false
				return args
			})
		}
	},
}

if (DEBUG && !PRODUCTION) {
	const inspector = require('inspector')
	inspector.open(+process.debugPort - 1)
	console.clear()
	require('exit-hook')(inspector.close)
}
