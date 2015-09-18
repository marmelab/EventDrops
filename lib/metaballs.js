"use strict";
/* global require, module */

var THREE = require('three');

module.exports = function (document, context, config, filterData, width, height) {

  var scene, camera, renderer;

  var WIDTH  = width;
  var HEIGHT = height;

  function init() {
    scene = new THREE.Scene();
    var camera = initCamera();
    var canvasRenderer = initRenderer();

    document.body.appendChild(renderer.domElement);

    return {scene:scene, renderer:canvasRenderer, camera: camera};
  }

  function initCamera() {
    //camera = new THREE.PerspectiveCamera(170, WIDTH / HEIGHT, 0.1, 10);
    camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 1, 1000 );
    camera.position.set(0,0,5);
    camera.lookAt(scene.position);

    return camera;
  }

  function initRenderer() {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(WIDTH, HEIGHT);
    renderer.setClearColor(new THREE.Color(0xffffff, 1.0));
    return renderer;
  }

  var render = function render(camera) {
    renderer.render(scene, camera);
  };

  return {
    init : init,
    render : render
  };

};
