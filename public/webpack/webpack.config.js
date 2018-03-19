'use strict';

const NODE_ENV = process.env.NODE_ENV || 'development';
const webpack = require('webpack');

module.exports = {
	entry: "./home",
	output: {
		filename: "build.js",
		library: "home"
	},
	watch: NODE_ENV == 'development',
	devtool: NODE_ENV == 'development' ? "source-map" : null,

	plugins: [
		// new webpack.DefinePlugin({
		// 	NODE_ENV: JSON.stringify(NODE_ENV),
		// 	LANG: JSON.stringify('ru')
		// })
	],
	module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    
                }
            }
        ]
    }

}