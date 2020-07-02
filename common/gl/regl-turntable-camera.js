'use strict';

var mat4create = require('gl-mat4/create');
var mat4multiply = require('gl-mat4/multiply');
var createCamera = require('inertial-turntable-camera');
var createInteractions = require('./interactions');

var RADIANS_PER_HALF_SCREEN_WIDTH = Math.PI * 2 * 0.4;

module.exports = function createReglCamera (regl, opts) {
  var element = regl._gl.canvas;
  element.addEventListener('wheel', event => event.preventDefault());

  function getAspectRatio () {
    return element.clientWidth / element.clientHeight;
  }

  var camera = createCamera(Object.assign({}, {
    aspectRatio: getAspectRatio(),
  }, opts || {}));

  var mProjectionView = mat4create();
  var setCameraUniforms = regl({
    context: {
      projection: () => camera.state.projection,
      view: () => camera.state.view,
      viewInv: () => camera.state.viewInv,
      eye: () => camera.state.eye,
    },
    uniforms: {
      uProjectionView: ctx => mat4multiply(mProjectionView, ctx.projection, ctx.view),
      uProjection: regl.context('projection'),
      uView: regl.context('view'),
      uEye: regl.context('eye'),
    }
  });

  function invokeCamera (props, callback) {
    if (!callback) {
      callback = props;
      props = {};
    }

    camera.tick(props);

    setCameraUniforms(function () {
      callback(camera.state, camera.params);
    });
  }

  invokeCamera.taint = camera.taint;
  invokeCamera.resize = camera.resize;
  invokeCamera.tick = camera.tick;
  invokeCamera.setUniforms = setCameraUniforms;

  invokeCamera.rotate = camera.rotate;
  invokeCamera.pan = camera.pan;
  invokeCamera.pivot = camera.pivot;
  invokeCamera.zoom = camera.zoom;

  Object.defineProperties(invokeCamera, {
    state: {
      get: function () { return camera.state; },
      set: function (value) { camera.state = value; }
    },
    params: {
      get: function () { return camera.params; },
      set: function (value) { camera.params = value; }
    },
    element: {
      get: function () { return element; }
    },
  });

  window.addEventListener('resize', function () {
    camera.resize(getAspectRatio());
  }, false);

  camera.element = regl._gl.canvas;
  createInteractions(camera);
  
  return invokeCamera;
};
