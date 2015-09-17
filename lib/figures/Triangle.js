var THREE = require('three');

module.exports = function (centerX, centerY, size, material) {
    var geometry = new THREE.Geometry();

    geometry.vertices.push(new THREE.Vector3(0,0,0));
    geometry.vertices.push(new THREE.Vector3(size,0,0));
    geometry.vertices.push(new THREE.Vector3(0,size,0));

    geometry.faces.push(new THREE.Face3(0, 1, 2));

    return new THREE.Mesh(geometry, material);
};
