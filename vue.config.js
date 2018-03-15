// 

const eyes = require('eyes')
Object.assign(eyes.defaults, { maxLength: 131072, showHidden: true })
const webpack = require('webpack')
const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin



global.NODE_ENV = process.env.NODE_ENV || 'development'
global.DEVELOPMENT = NODE_ENV == 'development'
global.PRODUCTION = NODE_ENV == 'production'



if (DEVELOPMENT) require('ora')({ spinner: 'runner', interval: 1000, hideCursor: true, stream: process.stdout }).start();

module.exports = {

	dll: true,
	outputDir: 'dist/client',

	css: {
		sourceMap: false,
	},

	vueLoader: {
		hotReload: false,
	},

	configureWebpack: function(config) {
		config.devtool = 'source-map'
		delete config.node.process

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
					delete use.options.limit
				})
			})
			config.plugins.push(new webpack.WatchIgnorePlugin([/node_modules/, /dist/, /server/]))
		}

		config.plugins.push(new webpack.optimize.CommonsChunkPlugin({
			name: 'vendors', minChunks: module => module.context && module.context.includes('node_modules'),
		}))
		config.plugins.push(new webpack.optimize.CommonsChunkPlugin({
			name: 'manifest', minChunks: Infinity,
		}))

		// config.plugins.push(new webpack.IgnorePlugin(/typescript/))
		// config.plugins.push(new BundleAnalyzerPlugin({ analyzerPort: 9999, openAnalyzer: false }))

	},

	chainWebpack: function(config) {
		// console.log('config.plugins', config.plugins)
		config.plugin('define').tap(function(args) {
			let { parsed } = dotenv.config({ path: path.resolve(process.cwd(), '.client.' + NODE_ENV + '.local') })
			Object.keys(parsed).forEach(k => args[0]['process.env'][k] = `"${parsed[k]}"`)
			return args
		})
		config.plugin('fork-ts-checker').tap(function(args) {
			args[0].tsconfig = 'src/client/client.tsconfig.json'
			// args[0].memoryLimit = 2048
			// args[0].workers = 4
			return args
		})
		config.plugins.delete('no-emit-on-errors')
		config.plugin('friendly-errors').tap(function(args) {
			args[0].clearConsole = false
			return args
		})
	},

}





/*████  BACKUP  ████*/

// // const styles = new ExtractTextPlugin('style.css')
// const ExtractTextPlugin = require('extract-text-webpack-plugin')
// const LiveReloadPlugin = require('webpack-livereload-plugin')
// const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin')

// module.exports = {

// 	dll: true,
// 	outputDir: 'dist/client',

// 	vueLoader: {
// 		hotReload: false,
// 		// extractCSS: false,
// 	},

// 	css: {
// 		// extract: false,
// 		sourceMap: true,
// 		// loaderOptions: {},
// 		// modules: true,
// 	},

// 	configureWebpack: function(config) {
// 		config.watch = true
// 		// config.profile = true
// 		// config.stats = 'minimal'
// 		// config.stats = 'errors-only'
// 		config.stats = {
// 			warnings: false, modules: false, performance: false,
// 			excludeAssets: [/fonts\//, /img\//],
// 		}
// 		// config.stats = false
// 		// config.stats = true
// 		config.devtool = 'source-map'
// 		delete config.node.process

// 		// let templated = '[name]' // '[hash].[name].[id].[query]'
// 		// config.output.filename = templated + '.bundle.js'
// 		// config.output.chunkFilename = templated + '.chunk.js'
// 		if (DEVELOPMENT) {
// 			config.output.filename = '[name].bundle.js'
// 			config.output.chunkFilename = 'chunk.[name].js'
// 		}
// 		if (PRODUCTION) {
// 			config.output.filename = '[name].bundle.[hash].js'
// 			config.output.chunkFilename = '[chunkhash].chunk.[hash].js'
// 		}

// 		config.plugins.push(new webpack.optimize.CommonsChunkPlugin({
// 			name: 'vendors', minChunks: module => module.context && module.context.includes('node_modules'),
// 		}))
// 		config.plugins.push(new webpack.optimize.CommonsChunkPlugin({
// 			name: 'manifest', minChunks: Infinity,
// 		}))
// 		// config.plugins.push(new webpack.optimize.AggressiveSplittingPlugin({
// 		// 	minSize: 30000, maxSize: 50000,
// 		// }))

// 		// config.plugins.push(new webpack.IgnorePlugin(/electron/))
// 		// config.plugins.push(new webpack.IgnorePlugin(/typescript/))
// 		// config.plugins.push(new webpack.IgnorePlugin(/server/))
// 		// config.plugins.push(new webpack.IgnorePlugin(/dist/))
// 		config.plugins.push(new webpack.WatchIgnorePlugin([/node_modules/, /dist/]))
// 		config.plugins.push(new LiveReloadPlugin({ appendScriptTag: true }))
// 		// config.plugins.push(new BundleAnalyzerPlugin({ analyzerPort: 9999, openAnalyzer: false }))
// 		// config.plugins.push(styles)
// 		// config.plugins.push(new ExtractTextPlugin('style.css'))
// 		// config.plugins.push(new HtmlWebpackHarddiskPlugin())

// 		// console.log('config >')
// 		// eyes.inspect(config)

// 	},

// 	chainWebpack: function(config) {
// 		console.log('config.plugins.store', config.plugins.store)
// 		config.plugins.delete('hmr')
// 		config.plugins.delete('no-emit-on-errors')
// 		config.plugin('friendly-errors').tap(function(args) {
// 			args[0].clearConsole = false
// 			return args
// 		})
// 		// config.plugin('fork-ts-checker').tap(function(args) {
// 		// 	// args[0].watch = []
// 		// 	args[0].memoryLimit = 1024
// 		// 	args[0].workers = 4
// 		// 	console.log('args[0] >')
// 		// 	eyes.inspect(args[0])
// 		// 	return args
// 		// })
// 		// config.plugin('html').tap(function(args) {
// 		// 	// args[0].hash = true
// 		// 	args[0].alwaysWriteToDisk = true
// 		// 	eyes.inspect(args[0], 'args[0]')
// 		// 	return args
// 		// })
// 	},

// }


