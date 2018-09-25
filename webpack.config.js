'use strict';
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpuckPlugin = require('clean-webpack-plugin');

module.exports = {
    entry: [
        './src/index.js'
    ],
    plugins: [
        new CleanWebpuckPlugin(['dist']),
        new HtmlWebpackPlugin({
            title: 'Output Managment',
            hash: true,
            template: './src/index.html'
        })
    ],
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'main.js'
    },
    // devtool: 'source-map',
    devServer: {
        contentBase: './dist'
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            }
        ]
    },
    watchOptions: {
        aggregateTimeout: 300,
        poll: 1000 // Check for changes every second
    }
}