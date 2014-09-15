(function () {
  function configurable(targetFunction, config) {
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

  d3.timeline = function (element, configData) {
    var svg;
    var config = {
      start: new Date(0),
      end: new Date()
    };

    var timeline = function () {
      if (!svg) {
        svg = d3.select(element)
          .append('svg')
        ;
      }
    };

    configurable(timeline, config);

    return timeline;
  };
})(d3);
