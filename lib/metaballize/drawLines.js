var THREE = require('three');
var Circle = require('../figures/Circle');
var Triangle = require('../figures/Triangle');

var Coor = require('./Coordinates');

module.exports = function (dates, coorY, color, scene, config, width, height) {
  var points = dates.map(function(date) {
    return { x: config.xScale(date), y: coorY, size: 15 };
  });

  function update() {
    var start = (new Date()).getTime();
    var len = points.length;
      for (var i = 0; i < 5; i++) {
      while ((len--) > 0) {
        var point = points[len];

      var material = new THREE.MeshBasicMaterial({
          color: color
      });

      var pointA = [0, 0, 0];
      var pointB = [15, 0, 0];
      var pointC = [0, 15, 0];

      var coor = Coor(point.x, point.y, width, height);

      //var triangle = new Triangle(coor.x, coor.y, 2, material);

      var circle = new Circle(15, 32, material);

      scene.add(circle);
      }
    }
  }

  update();
};
