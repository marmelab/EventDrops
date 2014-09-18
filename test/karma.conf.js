// karma.conf.js
module.exports = function(config) {
  config.set({
    basePath: '..',
    frameworks: ['jasmine'],
    browsers: ['Chrome'],
    files: [
      'node_modules/d3/d3.js',
      'src/timeline.js',
      'test/*'
    ]
  });
};
