'use strict';

var interactionEvents = require('../../lib/interaction-events');
var extend = require('xtend/mutable');
var identity = require('gl-mat4/identity');
var invert = require('gl-mat4/invert');
var multiply = require('gl-mat4/multiply');
var lookAt = require('gl-mat4/lookAt');
var perspective = require('gl-mat4/perspective');
var cross = require('gl-vec3/cross');
var subtract = require('gl-vec3/subtract');
var add = require('gl-vec3/add');
var transformMat4 = require('gl-vec3/transformMat4');
var mat4 = require('gl-mat4');

module.exports = function makeCamera2D (regl, opts) {
  opts = opts || {};
  var options = extend({
    element: opts.element || regl._gl.canvas,
  });

  var state = {
    distance: 35,
    phi: Math.PI * 0.4,
    theta: Math.PI / 2,
    lookAt: [0, 0, 0],
    fovY: Math.PI / 4,
    up: new Float32Array([0, 1, 0]),
    near: 0.1,
    far: 500,
    wheelSpeed: 1.0,
    panSpeed: 1.0
  };

  var aspect;
  var vCenterEye = new Float32Array(3);
  var vCenter = new Float32Array(3);
  var vEye = new Float32Array(3);
  var vRight = new Float32Array(3);
  var mView = new Float32Array(16);
  var mProjection = new Float32Array(16);
  var mViewInv = new Float32Array(16);

  var dView = new Float32Array(16);

  function getWidth () {
    if (element === window) {
      return element.innerWidth;
    } else {
      return element.offsetWidth;
    }
  }

  function getHeight () {
    if (element === window) {
      return element.innerHeight;
    } else {
      return element.offsetHeight;
    }
  }

  function getAspectRatio () {
    if (element === window) {
      return element.innerWidth / element.innerHeight;
    } else {
      return element.offsetWidth / element.offsetHeight;
    }
  }

  function computeMatrices () {
    vEye[0] = vCenter[0] + state.distance * Math.sin(state.phi) * Math.cos(state.theta);
    vEye[1] = vCenter[1] + state.distance * Math.cos(state.phi);
    vEye[2] = vCenter[2] + state.distance * Math.sin(state.phi) * Math.sin(state.theta);

    lookAt(mView, vEye, vCenter, state.up);
    perspective(mProjection, state.fovY, aspect, state.near, state.far);
    invert(mViewInv, mView);
  }

  function taint () {
    dirty = true;
  }

  function resize () {
    aspect = getAspectRatio();
    computeMatrices();
    taint();
  }

  var element = options.element;
  var dirty = true;

  var ie = interactionEvents({
    element: element,
  }).on('interactionstart', function (ev) {
    ev.preventDefault();
  }).on('interactionend', function (ev) {
    ev.preventDefault();
  }).on('interaction', function (ev) {
    if (!ev.buttons && (ev.type === undefined || ['wheel', 'touch', 'pinch'].indexOf(ev.type) === -1)) return;

    switch (ev.type) {
      case 'wheel':
        var x0 = ((ev.x0 / getWidth()) * 2.0 - 1.0) * state.distance;
        var y0 = -((ev.y0 / getHeight()) * 2.0 - 1.0) * state.distance;
        var zoom = Math.exp(ev.dy * 0.002 * state.wheelSpeed);
        identity(dView);
        mat4.translate(dView, dView, [x0 * 0.5, y0 * 0.5, 0]);
        mat4.scale(dView, dView, [zoom, zoom, 1]);
        mat4.translate(dView, dView, [-x0 * 0.5, -y0 * 0.5, 0]);

        transformMat4(vCenter, vCenter, mView);
        transformMat4(vCenter, vCenter, dView);
        transformMat4(vCenter, vCenter, mViewInv);

        state.distance *= zoom;

        ev.preventDefault();
        computeMatrices();
        taint();
        break;
      case 'pinch':
        var x0 = ((ev.x / getWidth()) * 2.0 - 1.0) * state.distance;
        var y0 = -((ev.y / getHeight()) * 2.0 - 1.0) * state.distance;
        identity(dView);
        mat4.translate(dView, dView, [-x0 * 0.5, -y0 * 0.5, 0]);
        mat4.scale(dView, dView, [ev.dsx, ev.dsy, 1]);
        mat4.translate(dView, dView, [-ev.dx * state.distance / getHeight(), ev.dy * state.distance / getHeight(), 0]);
        mat4.translate(dView, dView, [x0 * 0.5, y0 * 0.5, 0]);

        transformMat4(vCenter, vCenter, mView);
        transformMat4(vCenter, vCenter, dView);
        transformMat4(vCenter, vCenter, mViewInv);

        state.distance /= 0.5 * (ev.dsx + ev.dsy); 
        state.distance = Math.max(state.near * 2, Math.min(state.far / 2, state.distance));

        ev.preventDefault();
        computeMatrices();
        taint();

        break;
      case 'touch':
      case 'mousemove':
        if (ev.mods.meta) {
          identity(dView);
          dView[12] = -ev.dx * state.distance / getHeight();
          dView[13] = ev.dy * state.distance / getHeight();

          transformMat4(vCenter, vCenter, mView);
          transformMat4(vCenter, vCenter, dView);
          transformMat4(vCenter, vCenter, mViewInv);
        } else {
          state.theta += ev.dx / 200 * state.panSpeed;
          state.phi -= ev.dy / 200 * state.panSpeed;
          state.phi = Math.min(Math.PI - 1e-6, Math.max(1e-6, state.phi));
        }

        ev.preventDefault();
        computeMatrices();
        taint();
        break;
    }
  });

  var setProps = regl({
    uniforms: {
      view: () => mView,
      projection: () => mProjection,
      eye: () => vEye
    }
  });

  resize();

  return {
    on: ie.on.bind(ie),
    off: ie.off.bind(ie),
    once: ie.once.bind(ie),
    draw: function (cb) {
      setProps(() => cb({dirty: dirty}));
      dirty = false;
    },
    taint: taint,
    resize: resize
  };
}
