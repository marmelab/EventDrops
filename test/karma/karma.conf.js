export default config => {
    // Retrieve a Webpack config specialized in tests
    const webpackConfig = require('../../webpack.config.js');
    webpackConfig.context = __dirname + '/..';
    delete webpackConfig.entry;
    delete webpackConfig.output;

    config.set({
        basePath: '../..',
        frameworks: ['jasmine'],
        browsers: ['PhantomJS'],
        files: [
            './node_modules/d3/d3.js',
            './test/karma/bind.shim.js',
            './test/karma/*',
            './test/karma/**/*.js'
        ],
        plugins: ['karma-webpack', 'karma-jasmine', 'karma-phantomjs-launcher'],
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
