'use strict';
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpuckPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpack = require('webpack');

module.exports = {
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
    devtool: 'eval-source-map',
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
                    'css-hot-loader',
                    'style-loader',
                    MiniCssExtractPlugin.loader,
                    'css-loader'
                ]
            }
        ]
    },
    watchOptions: {
        aggregateTimeout: 300
    },
}
