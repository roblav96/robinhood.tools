// 
global.NODE_ENV = process.env.NODE_ENV || 'development'
global.DEVELOPMENT = NODE_ENV == 'development'
global.PRODUCTION = NODE_ENV == 'production'
// 

const eyes = require('eyes')
eyes.defaults.maxLength = 65536
eyes.defaults.showHidden = true
const webpack = require('webpack')
const path = require('path')
const _ = require('lodash')
const dotenv = require('dotenv')
const package = require('./package.json')



module.exports = {

	outputDir: 'dist/client',
	dll: DEVELOPMENT, // faster incremental recompilation, slower initial build
	css: { sourceMap: false }, // only enable when needed
	vueLoader: { hotReload: false }, // hot reload can make debugging difficult

	configureWebpack: function(config) {
		config.entry.app = './src/client/main.ts'
		_.unset(config.node, 'process') // required for `got` http client

		if (DEVELOPMENT) {
			config.devtool = 'source-map'
			config.plugins.push(new webpack.WatchIgnorePlugin([/node_modules/, /dist/, /server/, /assets/, /public/, /config/]))
			config.module.rules.filter(rule => Array.isArray(rule.use)).forEach(function(rule) {
				rule.use.filter(use => use.loader == 'url-loader').forEach(function(use) {
					use.loader = 'file-loader'; _.unset(use.options, 'limit');
				})
			})
		}

		// const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
		// config.plugins.push(new BundleAnalyzerPlugin())

	},

	chainWebpack: function(config) {
		config.plugin('define').tap(function(args) {
			// apply package properties as env variables
			args[0]['process.env'].NAME = `"${package.name}"`
			args[0]['process.env'].VERSION = `"${package.version}"`
			args[0]['process.env'].DOMAIN = `"${(DEVELOPMENT ? 'http://dev.' : 'https://') + package.domain}"`
			// import variables defined in ./config/
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
			args[0].clearConsole = false // don't clear my terminal/console
			return args
		})
	},

}


