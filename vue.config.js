// 
global.NODE_ENV = process.env.NODE_ENV || 'development'
global.DEVELOPMENT = NODE_ENV == 'development'
global.PRODUCTION = NODE_ENV == 'production'
// 

const webpack = require('webpack')
const path = require('path')
const _ = require('lodash')
const dotenv = require('dotenv')
const package = require('./package.json')



module.exports = {

	outputDir: 'dist/client',
	dll: DEVELOPMENT,
	css: { sourceMap: false },
	vueLoader: {
		hotReload: false,
		// postcss: [require('tailwindcss')(path.resolve(process.cwd(), 'src/client/styles/tailwind.js'))],
	},

	configureWebpack: function(config) {

		config.entry.app = './src/client/main.ts'
		delete config.node.process
		delete config.node.setImmediate

		if (DEVELOPMENT) {
			config.devtool = 'inline-source-map'
			config.plugins.push(new webpack.WatchIgnorePlugin([/node_modules/, /dist/, /server/, /assets/, /public/, /config/]))
			config.module.rules.filter(rule => Array.isArray(rule.use)).forEach(function(rule) {
				rule.use.filter(use => use.loader == 'url-loader').forEach(function(use) {
					use.loader = 'file-loader'
					delete use.options.limit
				})
			})
		}

		// const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
		// config.plugins.push(new BundleAnalyzerPlugin({ analyzerPort: _.random(10000, 12345) }))

		// config.output.filename = '[name].bundle.js'
		// config.output.chunkFilename = '[name].chunk.js'
		// const dlls = ['bluebird', 'node-forge', 'lodash', 'vue', 'buefy']
		// dlls.forEach(function(dll) {
		// 	config.plugins.push(new webpack.optimize.CommonsChunkPlugin({
		// 		name: dll, minChunks: module => module.context && module.context.includes(dll),
		// 	}))
		// })
		// config.plugins.push(new webpack.optimize.AggressiveSplittingPlugin({
		// 	minSize: 30000, maxSize: 50000,
		// }))
		// config.plugins.push(new webpack.optimize.CommonsChunkPlugin({
		// 	name: 'node_modules', minChunks: module => module.context && module.context.includes('node_modules'),
		// }))
		// config.plugins.push(new webpack.optimize.CommonsChunkPlugin({
		// 	name: 'manifest', minChunks: Infinity,
		// }))

	},

	chainWebpack: function(config) {

		config.plugin('define').tap(function(args) {
			args[0]['process.env'].NAME = `"${package.name}"`
			args[0]['process.env'].VERSION = `"${package.version}"`
			args[0]['process.env'].DOMAIN = `"${(DEVELOPMENT ? 'http://dev.' : 'https://') + package.domain}"`
			let env = dotenv.config({ path: path.resolve(process.cwd(), 'config/client.env') }).parsed || {}
			Object.assign(env, dotenv.config({ path: path.resolve(process.cwd(), 'config/client.' + NODE_ENV + '.env') }).parsed || {})
			Object.keys(env).forEach(k => args[0]['process.env'][k] = `"${env[k]}"`)
			return args
		})

		config.plugin('fork-ts-checker').tap(function(args) {
			args[0].tsconfig = '.client.tsconfig.json'
			return args
		})

		config.plugins.delete('no-emit-on-errors')

		config.plugin('friendly-errors').tap(function(args) {
			args[0].clearConsole = false
			return args
		})

	},

}

if (DEVELOPMENT) {
	const clc = require('cli-color')
	setInterval(() => process.stdout.write(clc.erase.lineRight), 1000)
}


