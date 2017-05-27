const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    entry: {
        demo: [
            './demo/demo.css',
            './demo/demo.js',
        ],
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'demo/dist'),
        library: 'eventDrops',
        libraryTarget: 'umd',
    },
    module: {
        rules: [
            {
                use: 'babel-loader',
                test: /\.js$/,
                include: [
                    path.resolve(__dirname, 'dist'),
                    path.resolve(__dirname, 'demo'),
                ],
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
                include: [
                    path.resolve(__dirname, 'dist'),
                    path.resolve(__dirname, 'demo'),
                ],
            },
        ],
    },
    plugins: [
        new webpack.ProvidePlugin({
            d3: 'd3',
        }),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'demo/index.html'),
        }),
    ],
};
