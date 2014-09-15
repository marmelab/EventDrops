module.exports = function configurable(targetFunction, config) {
  for (var item in config) {
    (function(item) {
      targetFunction[item] = function(value) {
        if (!arguments.length) return config[item];
        config[item] = value;

        return targetFunction;
      };
    })(item); // for doesn't create a closure, forcing it
  }
};
