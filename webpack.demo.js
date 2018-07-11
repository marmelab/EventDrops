const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        demo: ['./demo/demo.css', './demo/demo.js'],
    },
    mode: 'development',
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'demo/dist'),
        library: 'eventDrops',
        libraryTarget: 'umd',
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    module: {
        rules: [
            {
                test: /\.(t|j)s$/,
                include: [
                    path.resolve(__dirname, 'src'),
                    path.resolve(__dirname, 'demo'),
                ],
                use: 'awesome-typescript-loader?module=es6',
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
    plugins: [
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'demo/index.html'),
        }),
    ],
};
