'use strict';
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpuckPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpack = require('webpack');

// @todo: remove this mode fix
const yargs = require('yargs/yargs');
const {hideBin} = require('yargs/helpers');
const argv = yargs(hideBin(process.argv)).argv;
const MODE = argv.mode || process.env.NODE_ENV || 'none';

module.exports = {
    mode: MODE,
    entry: './src/index.js',
    plugins: [
        new MiniCssExtractPlugin(),
        new CleanWebpuckPlugin(['dist']),
        new HtmlWebpackPlugin({
            title: 'Puzzle HTML 5',
            hash: true,
            template: './src/index.html'
        }),
        new webpack.HotModuleReplacementPlugin()
    ],
    output: {
        path: path.resolve(__dirname, 'dist'),
        pathinfo: true,
        filename: '[name].js'
    },
    devServer: {
        contentBase: './dist',
        hot: true
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                        plugins: [require('@babel/plugin-proposal-object-rest-spread')]
                    }
                }
            },
            {
                test: /\.css$/,
                use: [
                    MODE === 'development' ? 'style-loader' : MiniCssExtractPlugin.loader,
                    'css-loader'
                ]
            }
        ]
    },
    watchOptions: {
        aggregateTimeout: 300
    },
}
