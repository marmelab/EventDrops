const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
    entry: {
        eventDrops: [
            path.join(__dirname, '../demo/demo.js'),
            path.join(__dirname, '../style.css'),
            path.join(__dirname, '../demo/demo.css'),
        ],
    },
    output: {
        publicPath: '',
        path: path.join(__dirname, '../dist/demo'),
        filename: '[name].js',
    },
    module: {
        loaders: [
            { test: /\.js$/, exclude: /node_modules/, loader: 'babel' },
            { test: /\.css$/, loader: ExtractTextPlugin.extract('css') },
        ],
    },
    plugins: [
        new ExtractTextPlugin('[name].css'),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, '../demo/index.html'),
            hash: true,
            inject: true,
        }),
    ],
};
