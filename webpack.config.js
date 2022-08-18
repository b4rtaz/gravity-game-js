const path = require('path');
const webpack = require('webpack');

module.exports = {
	entry: './src/app.ts',
	target: 'web',
	mode: 'development',
	output: {
		path: path.resolve(path.join(__dirname, 'dist')),
		filename: 'app.js'
	},
	resolve: {
		extensions: ['.ts', '.js']
	},
	plugins: [
		new webpack.ProvidePlugin({
		  'THREE': 'three'
		})
	],
	module: {
		rules: [
			{
				loader: 'ts-loader',
				test: /\.ts?$/,
				options: {
					configFile: 'tsconfig.json'
				}
			}
		]
	}
};
