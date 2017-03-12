var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var ProvidePlugin = require('webpack').ProvidePlugin;

var path = require('path');

module.exports = function(production) {
    var plugins = [
        new ExtractTextPlugin('[name].css'),
    ];

    if (!production) {
        plugins.push(new HtmlWebpackPlugin({
            template: path.join(__dirname, '../demo/index-dev.html'),
            hash: true
        }));

        plugins.push(new CopyWebpackPlugin([
            { from: path.join(__dirname, '../node_modules/d3/build/d3.min.js') }
        ]))
    }


    return plugins;
};
