export default (targetFunction, config, listeners = {}) => {
    for (var item in config) {
      // for loop doesn't create a closure, forcing it
      (item => {
          targetFunction[item] = value => {
              if (!arguments.length) return config[item];

              config[item] = value;
              if (listeners.hasOwnProperty(item)) {
                  listeners[item](value);
              }

              return targetFunction;
          };
      })(item);
  }
};
