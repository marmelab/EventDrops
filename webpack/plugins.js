var HtmlWebpackPlugin = require('html-webpack-plugin');
var ProvidePlugin = require('webpack').ProvidePlugin;

var path = require('path');

module.exports = function (production) {
    var plugins = [];

    if (!production) {
        plugins.push(new HtmlWebpackPlugin({
            template: path.join(__dirname, '../demo/index.html'),
            hash: true
        }));
    }

    return plugins;
};
