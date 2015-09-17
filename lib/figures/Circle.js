var THREE = require('three');

module.exports = function (radius, segments, material) {

  var circleGeometry = new THREE.CircleGeometry( radius, segments );

  return new THREE.Mesh(circleGeometry, material);
};
