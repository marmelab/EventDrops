const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

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
                    path.resolve(__dirname, 'src'),
                    path.resolve(__dirname, 'demo'),
                ],
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
                include: [
                    path.resolve(__dirname, 'src'),
                    path.resolve(__dirname, 'demo'),
                ],
            },
        ],
    },
    devtool: 'cheap-module-eval-source-map',
    plugins: [
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'demo/index.html'),
        }),
    ],
};
