const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    entry: {
        eventDrops: './src',
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
        library: 'eventDrops',
        libraryTarget: 'umd',
    },
    externals: {
        d3: 'd3',
    },
    module: {
        rules: [
            {
                use: 'babel-loader',
                test: /\.js$/,
                include: [path.resolve(__dirname, 'src')],
            },
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({ use: 'css-loader' }),
                include: [path.resolve(__dirname, 'src')],
            },
        ],
    },
    plugins: [new ExtractTextPlugin('style.css')],
};
