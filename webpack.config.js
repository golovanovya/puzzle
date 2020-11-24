'use strict';
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpuckPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpack = require('webpack');

module.exports = {
    // context: path.resolve(__dirname),
    entry: {
        vendor: [
            'jquery',
            'bootstrap/dist/css/bootstrap.min.css',
            'bootstrap',
            'konva'
        ],
        bundle: './src/index.js'
    },
    plugins: [
        // new CleanWebpuckPlugin(['dist']),
        new HtmlWebpackPlugin({
            title: 'Puzzle HTML 5',
            // hash: true,
            template: './src/index.html'
        }),
        // new MiniCssExtractPlugin({
        //     // Options similar to the same options in webpackOptions.output
        //     // both options are optional
        //     filename: "[name].css",
        //     chunkFilename: "[id].css"
        // }),
        // new webpack.HashedModuleIdsPlugin(),
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
                    // MiniCssExtractPlugin.loader,
                    'css-loader'
                ]
            }
        ]
    },
    watchOptions: {
        aggregateTimeout: 300,
        poll: 300 // Check for changes every second
    },
    optimization: {
        runtimeChunk: 'single',
        splitChunks: {
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all'
            }
          }
        }
    }
}