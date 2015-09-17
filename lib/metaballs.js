"use strict";
/* global require, module */

var THREE = require('three');
var Triangle = require('./figures/Triangle');
var Circle = require('./figures/Circle');

module.exports = function (context, config, filterData, width, height) {

  var scene, camera, renderer;

  var WIDTH  = width;
  var HEIGHT = height;

  function init() {
    scene = new THREE.Scene();
    initCamera();
    var canvasRenderer = initRenderer();

    var pointA = [0, 0, 0];
    var pointB = [1, 0, 0];
    var pointC = [0, 1, 0];
    var material = new THREE.MeshBasicMaterial({
        color: 0xFF0000
    });

    //var triangle = new Triangle(pointA, pointB, pointC, material);
    //scene.add(triangle);

    //var circle = new Circle(2, 32, material);
    //scene.add(circle);

    document.body.appendChild(renderer.domElement);

    return {scene:scene, renderer:canvasRenderer};
  }

  function initCamera() {
    camera = new THREE.PerspectiveCamera(170, WIDTH / HEIGHT, 0.1, 10);
    camera.position.set(0,0,5);
    camera.lookAt(scene.position);
  }

  function initRenderer() {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(WIDTH, HEIGHT);
    return renderer;
  }

  // var triangles = [], SPEED = 10;
  // var nb = 4;
  // var theta = 2*Math.PI / nb;
  // var ang = 0;
  // function drawCircles(x, y, size, scene, colors) {
  //   for (var i = 0; i < nb; i++) {
  //     var triangleGeometry = new THREE.Geometry();
  //     triangleGeometry.vertices.push(new THREE.Vector3( x,  y, 0.0));
  //     triangleGeometry.vertices.push(new THREE.Vector3(x + Math.cos(ang), y + Math.sin(ang), 0.0));
  //     ang += theta;
  //     triangleGeometry.vertices.push(new THREE.Vector3(x + Math.cos(ang), y + Math.sin(ang), 0.0));
  //     triangleGeometry.faces.push(new THREE.Face3(0, 1, 2));

  //     var triangleMaterial = new THREE.MeshBasicMaterial({
  //       color:colors,
  //       side:THREE.DoubleSide
  //     });

  //     var triangleMesh = new THREE.Mesh(triangleGeometry, triangleMaterial);
  //     triangleMesh.position.set(0, 0, 4.0);
  //     scene.add(triangleMesh);

  //     triangles.push(triangleMesh);
  //   }

  // }

  var render = function render() {
    renderer.render(scene, camera);
  };

  return {
    init : init,
    render : render
  };

};
