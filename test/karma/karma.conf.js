module.exports = function (config) {
    // Retrieve a Webpack config specialized in tests
    var webpackConfig = require('../../webpack.config.js');
    webpackConfig.context = __dirname + '/../..';
    delete webpackConfig.entry;
    delete webpackConfig.output;

    config.set({
        basePath: '../..',
        browserNoActivityTimeout: 30000,
        frameworks: ['jasmine'],
        browsers: ['Firefox'],
        files: [
            './node_modules/d3/d3.js',
            './test/karma/*',
            './test/karma/**/*.js'
        ],
        plugins: ['karma-webpack', 'karma-jasmine', 'karma-firefox-launcher'],
        preprocessors: {
            'lib/**/*.js': 'webpack',
            'test/karma/**/*.js': 'webpack'
        },
        webpackMiddleware: {
            noInfo: true,
            devtool: 'inline-source-map'
        },
        webpack: webpackConfig
    });
};
