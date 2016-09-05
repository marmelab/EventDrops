const ExtractTextPlugin = require('extract-text-webpack-plugin');
const PRODUCTION = process.argv[2] === '-p';

module.exports = {
    entry: require('./webpack/entries')(PRODUCTION),
    output: {
        publicPath: '',
        path: 'dist/',
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
    plugins: require('./webpack/plugins')(PRODUCTION),
};
