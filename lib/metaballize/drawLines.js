var THREE = require('three');

var Circle = require('../figures/Circle');

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

      var geometry = new THREE.CircleGeometry(15, 32);

      geometry.applyMatrix( new THREE.Matrix4().makeTranslation(point.x - width/2, -(point.y - height/2), 0));

      var circle = new Circle(material, geometry);

      scene.add(circle);
      }
    }
  }
  update();
};
