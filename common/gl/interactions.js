'use strict';

const vec3TransformMat4 = require('gl-vec3/transformMat4');
const interactionEvents = require('normalized-interaction-events');
const assert = require('assert');

module.exports = attachCameraControls;

const RADIANS_PER_HALF_SCREEN_WIDTH = Math.PI * 0.75;

function attachCameraControls (camera, opts) {
  opts = opts || {};
  var element = camera.element;

  var onStart = null;
  var onEnd = null;
  var onMove = null;

  var singletonEventData = {
    defaultPrevented: false
  };

  function localPreventDefault () {
    singletonEventData.defaultPrevented = true;
  }

  function resetLocalPreventDefault () {
    singletonEventData.defaultPrevented = false;
  }

  function providePreventDefault (ev) {
    ev.defaultPrevented = singletonEventData.defaultPrevented;
    ev.preventDefault = function () {
      ev.defaultPrevented = true;
      localPreventDefault();
    };
    return ev;
  }

  var v = [0, 0, 0];
  var xy = [0, 0];
  function transformXY(ev) {
    v[0] = ev.x;
    v[1] = ev.y;
    v[2] = 0;
    if (opts.invViewportShift) {
      vec3TransformMat4(v, v, invViewportShift);
    }
    xy[0] = v[0];
    xy[1] = v[1];
    return xy;
  }

  interactionEvents(element)
    .on('wheel', function (ev) {
      camera.zoom(ev.x0, ev.y0, Math.exp(-ev.dy) - 1.0);
    })
    .on('mousedown', function (ev) {
      resetLocalPreventDefault();

      ev = providePreventDefault(ev);
      onStart && onStart(ev);

      ev.originalEvent.preventDefault();
    })
    .on('mousemove', function (ev) {
      ev = providePreventDefault(ev);
      onMove && onMove(ev);

      if (ev.defaultPrevented) return;

      if (!ev.active || ev.buttons !== 1) return;

      if (ev.mods.alt) {
        camera.zoom(ev.x0, ev.y0, Math.exp(ev.dy) - 1.0);
        ev.originalEvent.preventDefault();
      } else if (ev.mods.shift) {
        camera.pan(ev.dx, ev.dy);
        ev.originalEvent.preventDefault();
      } else if (ev.mods.meta) {
        camera.pivot(ev.dx, ev.dy);
        ev.originalEvent.preventDefault();
      } else {
        camera.rotate(
          -ev.dx * RADIANS_PER_HALF_SCREEN_WIDTH,
          -ev.dy * RADIANS_PER_HALF_SCREEN_WIDTH
        );
        ev.originalEvent.preventDefault();
      }
    })
    .on('mouseup', function (ev) {
      ev.originalEvent.preventDefault();
      resetLocalPreventDefault();
      ev = providePreventDefault(ev);
      onEnd && onEnd(ev);
    })
    .on('touchstart', function (ev) {
      ev.originalEvent.preventDefault();

      ev = providePreventDefault(ev);
      onStart && onStart(ev);
    })
    .on('touchmove', function (ev) {
      ev = providePreventDefault(ev);
      onMove && onMove(ev);

      if (ev.defaultPrevented) return;

      if (!ev.active) return;
      camera.rotate(
        -ev.dx * RADIANS_PER_HALF_SCREEN_WIDTH,
        -ev.dy * RADIANS_PER_HALF_SCREEN_WIDTH
      );
      ev.originalEvent.preventDefault();
    })
    .on('touchend', function (ev) {
      ev.originalEvent.preventDefault();
      resetLocalPreventDefault();
      ev = providePreventDefault(ev);
      onEnd && onEnd(ev);
    })
    .on('pinchmove', function (ev) {
      if (!ev.active) return;
      transformXY(ev);
      camera.zoom(xy[0], xy[1], 1 - ev.zoomx);
      camera.pan(ev.dx, ev.dy);

      ev.originalEvent.preventDefault();
    })
    .on('pinchstart', function (ev) {
      ev.originalEvent.preventDefault();
    });

  onStart = opts.onStart;
  onMove = opts.onMove;
  onEnd = opts.onEnd;

  return {
    setInteractions: function (interactions) {
      assert(interactions);
      onStart = interactions.onStart;
      onEnd = interactions.onEnd;
      onMove = interactions.onMove;
    }
  };
}
