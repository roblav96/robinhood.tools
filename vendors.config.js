// 

const _ = require('lodash')
const path = require('path')
const webpack = require('webpack')
const package = require('./package.json')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin



// const wpconfig = require('@vue/cli-service/webpack.config')
// module.exports = _.merge()

module.exports = {
	context: process.cwd(),
	resolve: {
		extensions: ['.js', '.jsx', '.json', '.sass', '.scss', '.css'],
		modules: [__dirname, 'node_modules'],
	},
	entry: {
		vendors: [
			'asn1.js',
			'bn.js',
			'buefy',
			'core-js',
			'echarts',
			'echarts-stat',
			'elliptic',
			'fingerprintjs2',
			'hash.js',
			'html-entities',
			'lodash',
			'node-forge',
			'simple-get',
			'vue',
			'vue-class-component',
			'vue-property-decorator',
			'vue-router',
			'vuex',
			'zousan',
			'zrender',
			// '____',
		],
	},
	output: {
		filename: '[name].dll.js',
		path: path.resolve(__dirname, 'public'),
		library: '[name]',
	},
	plugins: [
		new webpack.DllPlugin({
			name: '[name]',
			path: path.resolve(__dirname, 'public/[name].json'),
		}),
		// new BundleAnalyzerPlugin(),
	],
}


