var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ProvidePlugin = require('webpack').ProvidePlugin;

var path = require('path');

module.exports = function (production) {
    var plugins = [
        new ExtractTextPlugin('[name].css'),
    ];

    if (!production) {
        plugins.push(new HtmlWebpackPlugin({
            template: path.join(__dirname, '../demo/index-dev.html'),
            hash: true
        }));
    }

    return plugins;
};
