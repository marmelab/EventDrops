const ExtractTextPlugin = require('extract-text-webpack-plugin');
const path = require('path');

module.exports = {
    entry: {
        eventDrops: [
            path.join(__dirname, '../lib/eventDrops'),
            path.join(__dirname, '../style.css'),
        ],
    },
    output: {
        publicPath: '',
        path: path.join(__dirname, '../dist/'),
        filename: '[name].js',
        library: 'eventDrops',
        libraryTarget: 'umd',
    },
    module: {
        loaders: [
            { test: /\.js$/, exclude: /node_modules/, loader: 'babel' },
            { test: /\.css$/, loader: ExtractTextPlugin.extract('css') },
        ],
    },
    externals: {
        d3: 'd3',
    },
    plugins: [
        new ExtractTextPlugin('[name].css'),
    ],
};
