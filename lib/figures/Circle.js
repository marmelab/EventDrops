var THREE = require('three');

module.exports = function (material, circleGeometry) {

  //var circleGeometry = new THREE.CircleGeometry( radius, segments );

  return new THREE.Mesh(circleGeometry, material);
};
