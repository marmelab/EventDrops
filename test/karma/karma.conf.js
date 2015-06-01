'use strict';

// karma.conf.js
module.exports = function(config) {
  config.set({
    basePath: '../..',
    frameworks: ['jasmine'],
    browsers: ['PhantomJS'],
    plugins: [
      'karma-jasmine',
      'karma-phantomjs-launcher'
    ],
    files: [
      './node_modules/d3/d3.js',
      './src/eventDrops.js',
      './test/karma/*'
    ]
  });
};
