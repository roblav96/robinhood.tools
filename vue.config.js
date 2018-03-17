// 

const eyes = require('eyes'); eyes.defaults.maxLength = 65536; eyes.defaults.showHidden = true;
const webpack = require('webpack')
const fs = require('fs')
const url = require('url')
const path = require('path')
const _ = require('lodash')
const dotenv = require('dotenv')
const package = require('./package.json')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')



global.NODE_ENV = process.env.NODE_ENV || 'development'
global.DEVELOPMENT = NODE_ENV == 'development'
global.PRODUCTION = NODE_ENV == 'production'



module.exports = {

	dll: true,
	// dll: Object.keys(package.dependencies),
	outputDir: 'dist/client',
	css: { sourceMap: false },
	vueLoader: { hotReload: false },

	configureWebpack: function(config) {
		config.entry.app = './src/client/main.ts'
		config.devtool = 'source-map'
		_.unset(config.node, 'process')

		config.output.filename = '[name].bundle.[hash].js'
		config.output.chunkFilename = '[chunkhash].chunk.[hash].js'

		if (DEVELOPMENT) {
			config.output.filename = '[name].bundle.js'
			config.output.chunkFilename = 'chunk.[name].js'
			config.module.rules.forEach(function(rule) {
				if (!Array.isArray(rule.use)) return;
				rule.use.forEach(function(use) {
					if (use.loader != 'url-loader') return;
					use.loader = 'file-loader'
					_.unset(use.options, 'limit')
				})
			})
			config.plugins.push(new webpack.WatchIgnorePlugin([/node_modules/, /dist/, /server/]))
		}

		config.plugins.push(new webpack.optimize.CommonsChunkPlugin({
			name: 'vendor', minChunks: ({ context }) => context && context.includes('node_modules'),
		}))
		config.plugins.push(new webpack.optimize.CommonsChunkPlugin({
			name: 'manifest', minChunks: Infinity,
		}))

		config.plugins.push(new webpack.IgnorePlugin(/typescript/))

		// config.plugins.push(new BundleAnalyzerPlugin())

	},

	chainWebpack: function(config) {
		// console.log('config.plugins', config.plugins)
		config.plugin('define').tap(function(args) {
			args[0]['process.env'].NAME = `"${package.name}"`
			args[0]['process.env'].VERSION = `"${package.version}"`
			args[0]['process.env'].DOMAIN = `"${(DEVELOPMENT ? 'http://dev.' : 'https://') + package.domain}"`
			let env = dotenv.config({ path: path.resolve(process.cwd(), 'config/client.' + NODE_ENV + '.env') }).parsed || {}
			Object.keys(env).forEach(k => args[0]['process.env'][k] = `"${env[k]}"`)
			return args
		})
		config.plugin('fork-ts-checker').tap(function(args) {
			args[0].tsconfig = 'config/client.tsconfig.json'
			return args
		})
		config.plugins.delete('no-emit-on-errors')
		config.plugin('friendly-errors').tap(function(args) {
			args[0].clearConsole = false
			return args
		})
	},

}


