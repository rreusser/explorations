'use strict';

module.exports = interactionEvents;

var extend = require('util-extend');
var mouse = require('mouse-event');
var mouseChange = require('mouse-change');
var eventOffset = require('mouse-event-offset');
var eventEmitter = require('event-emitter');

function Finger () {
  this.position = [0, 0]
  this.touch = null
}

function interactionEvents (opts, callback) {
  var options = extend({
    element: window,
    constrainZoom: false,
  }, opts || {});

  var emitter = eventEmitter({});

  var element = options.element;
  var enabled = false;
  var mouseDown = false;
  var wheelSpeed = 0.01;
  var pPos = [null, null];
  var fingers = [null, null];
  var ended = false;
  var activeCount = 0;
  var xprev, yprev, enabled = false;

  var ev = {};

  var buttons = 0, mods = {};
  var changeListener = mouseChange(element, function(pbuttons, px, py, pmods) {
    buttons = pbuttons;
    mods = pmods;
  });

  function forward(evOut, evIn) {
    evOut.preventDefault = evIn.preventDefault.bind(evIn);
    evOut.stopPropagation = evIn.stopPropagation.bind(evIn);
    return evOut;
  }

  function noop () {}

  var pickup = 1.0;
  var prevEvent = {};
  var lastEvent = {
    dx: 0.0,
    dy: 0.0,
    dz: 0.0,
    dsx: 0.0,
    dsy: 0.0,
    dsz: 0.0,
    dtheta: 0.0,
  };
  var continuing = false;

  function queue (event) {
    continuing = true;
    Object.assign(lastEvent, event);
    lastEvent.preventDefault = noop;
    lastEvent.stopPropagation = noop;
    lastEvent.dx = pickup * event.dx + (1.0 - pickup) * lastEvent.dx;
    lastEvent.dy = pickup * event.dy + (1.0 - pickup) * lastEvent.dy;
    lastEvent.dz = pickup * event.dz + (1.0 - pickup) * lastEvent.dz;
    lastEvent.dsx = pickup * event.dsx + (1.0 - pickup) * lastEvent.dsx;
    lastEvent.dsy = pickup * event.dsy + (1.0 - pickup) * lastEvent.dsy;
    lastEvent.dsz = pickup * event.dsz + (1.0 - pickup) * lastEvent.dsz;
    lastEvent.dtheta = pickup * event.dtheta + (1.0 - pickup) * lastEvent.dtheta;
    lastEvent.buttons = event.buttons;
    lastEvent.mods = Object.assign({}, event.mods);
  }

  var t0 = null;
  var dxTol = 0.01;
  var dyTol = 0.01;
  var dzTol = 0.01;
  var dsxTol = 0.01;
  var dsyTol = 0.01;
  var dszTol = 0.01;
  var dthetaTol = 0.01;
  var timeConstant = 0.1;
  var decayConstant = 1 / (1000 * timeConstant) * Math.log(2);

  function idleEmit (t) {
    if (!interacting && continuing) {
      emitter.emit('interaction', lastEvent);
    }

    var dt = t - t0;
    var decay = Math.exp(-dt * decayConstant);

    if (continuing) {
      lastEvent.dx *= decay;
      lastEvent.dy *= decay;
      lastEvent.dz *= decay;
      lastEvent.dsx = 1 + (lastEvent.dsx - 1) * decay;
      lastEvent.dsy = 1 + (lastEvent.dsy - 1) * decay;
      lastEvent.dsz = 1 + (lastEvent.dsz - 1) * decay;
      lastEvent.dtheta *= decay;

      if (Math.abs(lastEvent.dx) < dxTol &&
        Math.abs(lastEvent.dy) < dyTol &&
        Math.abs(lastEvent.dz) < dzTol &&
        Math.abs(lastEvent.dsx - 1) < dsxTol &&
        Math.abs(lastEvent.dsy - 1) < dsyTol &&
        Math.abs(lastEvent.dsz - 1) < dszTol &&
        Math.abs(lastEvent.dtheta) < dthetaTol
      ) {
        continuing = false;
      }
    }

    requestAnimationFrame(idleEmit);
    t0 = t;
  }

  idleEmit();

  var interacting = false;

  function onWheel (event) {
    var dx, dy, dz, x0, y0;

    ev.type = 'wheel';
    ev.buttons = buttons;
    ev.mods = mods;
    ev.x0 = event.x;
    ev.y0 = event.y;
    ev.dx = event.deltaX;
    ev.dy = event.deltaY;
    ev.dz = event.deltaZ;
    ev.dsx = 1;
    ev.dsy = 1;
    ev.dsz = 1;
    ev.theta = 0;
    ev.dtheta = 0;

    continuing = false;
    interacting = true;
    emitter.emit('interaction', forward(ev, event));
  }

  function onMouseUp (event) {
    interacting = false;
  }

  function onMouseDown (event) {
    xprev = mouse.x(event);
    yprev = mouse.y(event);

    ev.type = 'mousedown';
    ev.buttons = buttons;
    ev.mods = mods;
    ev.x0 = xprev;
    ev.y0 = yprev;
    ev.dx = 0;
    ev.dy = 0;
    ev.dz = 0;
    ev.dsx = 1;
    ev.dsy = 1;
    ev.dsz = 1;
    ev.theta = 0;
    ev.dtheta = 0;

    continuing = false;
    interacting = true;
    emitter.emit('interactionend', forward(ev, event));
  }

  function onMouseMove (event) {
    var x = mouse.x(event);
    var y = mouse.y(event);

    ev.type = 'mousemove';
    ev.buttons = buttons;
    ev.mods = mods;
    ev.x0 = x;
    ev.y0 = y;
    ev.dx = x - xprev;
    ev.dy = y - yprev;
    ev.dz = 0;
    ev.dsx = 1;
    ev.dsy = 1;
    ev.dsz = 1;
    ev.theta = 0;
    ev.dtheta = 0;

    xprev = x;
    yprev = y;

    if (ev.buttons) {
      queue(ev);
    }
    emitter.emit('interaction', forward(ev, event));
  }

  function indexOfTouch (touch) {
    var id = touch.identifier
    for (var i = 0; i < fingers.length; i++) {
      if (fingers[i] &&
        fingers[i].touch &&
        fingers[i].touch.identifier === id) {
        return i
      }
    }
    return -1
  }

  function onTouchStart (event) {
    pPos = [null, null];
    for (var i = 0; i < event.changedTouches.length; i++) {
      var newTouch = event.changedTouches[i]
      var id = newTouch.identifier
      var idx = indexOfTouch(id)

      if (idx === -1 && activeCount < 2) {
        var first = activeCount === 0

        // newest and previous finger (previous may be undefined)
        var newIndex = fingers[0] ? 1 : 0
        var oldIndex = fingers[0] ? 0 : 1
        var newFinger = new Finger()

        // add to stack
        fingers[newIndex] = newFinger
        activeCount++

        // update touch event & position
        newFinger.touch = newTouch
        eventOffset(newTouch, element, newFinger.position)

        var oldTouch = fingers[oldIndex] ? fingers[oldIndex].touch : undefined
        if (!first) {
          ended = false
        }
      }
    }

    if (activeCount > 0) {
      ev.type = activeCount === 1 ? 'touchstart' : 'pinchstart';
      ev.buttons = 0;
      ev.mods = {};
      ev.x0 = 0;
      ev.y0 = 0;
      ev.dx = 0;
      ev.dy = 0;
      ev.dz = 0;
      ev.dsx = 1;
      ev.dsy = 1;
      ev.dsz = 1;
      ev.theta = 0;
      ev.dtheta = 0;

      interacting = true;
      queue(ev);
      emitter.emit('interactionstart', forward(ev, event));
    }
  }

  var px0 = null;
  var py0 = null;
  function onTouchMove (event) {
    var idx;
    var changed = false
    for (var i = 0; i < event.changedTouches.length; i++) {
      var movedTouch = event.changedTouches[i]
      idx = indexOfTouch(movedTouch)
      if (idx !== -1) {
        changed = true
        fingers[idx].touch = movedTouch // avoid caching touches
        eventOffset(movedTouch, element, fingers[idx].position)
      }
    }

    if (changed) {
      if (activeCount === 0) {
        interacting = false;
      } else if (activeCount === 1) {
        for (idx = 0; idx < fingers.length; idx++) {
          if (fingers[idx]) break;
        }

        if (fingers[idx] && pPos[idx]) {
          var x = fingers[idx].position[0];
          var y = fingers[idx].position[1];

          var dx = x - pPos[idx][0];
          var dy = y - pPos[idx][1];

          ev.type = 'touch';
          ev.buttons = 0;
          ev.mods = {};
          ev.x0 = x;
          ev.y0 = y;
          ev.dx = dx;
          ev.dy = dy;
          ev.dz = 0;
          ev.dsx = 1;
          ev.dsy = 1;
          ev.dsz = 1;
          ev.theta = 0;
          ev.dtheta = 0;

          interacting = true;
          queue(ev);
          emitter.emit('interaction', forward(ev, event));
        }
      } else if (activeCount === 2) {
        if (pPos[0] && pPos[1]) {
          // Previous two-finger vector:
          var pos0A = pPos[0];
          var pos0B = pPos[1];
          var dx0 = pos0B[0] - pos0A[0];
          var dy0 = pos0B[1] - pos0A[1];

          // Current two-finger vector:
          var pos1A = fingers[0].position;
          var pos1B = fingers[1].position;
          var dx1 = pos1B[0] - pos1A[0];
          var dy1 = pos1B[1] - pos1A[1];

          // r, theta for the previous two-finger touch:
          var r0 = Math.sqrt(dx0 * dx0 + dy0 * dy0);
          var theta0 = Math.atan2(dy0, dx0);

          // r, theta for the current two-finger touch:
          var r1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
          var theta1 = Math.atan2(dy1, dx1);

          var x0 = (pos0B[0] + pos0A[0]) * 0.5;
          var y0 = (pos0B[1] + pos0A[1]) * 0.5;
          var dx = 0.5 * (pos1B[0] + pos1A[0] - pos0A[0] - pos0B[0]);
          var dy = 0.5 * (pos1B[1] + pos1A[1] - pos0A[1] - pos0B[1]);
          var dr = r1 / r0;
          var dtheta = theta1 - theta0;

          ev.type = 'pinch';
          ev.buttons = 0;
          ev.mods = {};
          ev.x0 = x0;
          ev.y0 = y0;
          ev.dx = dx;
          ev.dy = dy;
          ev.dz = 0;
          ev.dsx = dr;
          ev.dsy = dr;
          ev.dsz = 1;
          ev.theta = theta1;
          ev.dtheta = dtheta;

          interacting = true;
          queue(ev);
          emitter.emit('interaction', forward(ev, event));

          px0 = x0;
          py0 = y0;
        }
      }
    }

    if (fingers[0]) {
      pPos[0] = fingers[0].position.slice();
    }

    if (fingers[1]) {
      pPos[1] = fingers[1].position.slice();
    }
  }

  function onTouchRemoved (event) {
    for (var i = 0; i < event.changedTouches.length; i++) {
      var removed = event.changedTouches[i]
      var idx = indexOfTouch(removed)

      if (idx !== -1) {
        fingers[idx] = null
        activeCount--
        var otherIdx = idx === 0 ? 1 : 0
        var otherTouch = fingers[otherIdx] ? fingers[otherIdx].touch : undefined
      }
    }

    if (!ended && activeCount !== 2) {
      interacting = false;
      ended = true
    }

    if (activeCount < 2) {
      ev.type = activeCount === 0 ? 'touchend' : 'pinchend';
      ev.buttons = 0;
      ev.mods = {};
      ev.x0 = 0;
      ev.y0 = 0;
      ev.dx = 0;
      ev.dy = 0;
      ev.dz = 0;
      ev.dsx = 1;
      ev.dsy = 1;
      ev.dsz = 1;
      ev.theta = 0;
      ev.dtheta = 0;

      interacting = false;
      emitter.emit('interactionend', forward(ev, event));
    }
  }


  function enable () {
    if (enabled) return;
    enabled = true;
    changeListener.enabled = true;
    element.addEventListener('wheel', onWheel, false);
    element.addEventListener('mousedown', onMouseDown, false);
    window.addEventListener('mousemove', onMouseMove, false);
    window.addEventListener('mouseup', onMouseUp, false);

    element.addEventListener('touchstart', onTouchStart, false);
    window.addEventListener('touchmove', onTouchMove, false);
    window.addEventListener('touchend', onTouchRemoved, false)
    window.addEventListener('touchcancel', onTouchRemoved, false)
  }

  function disable () {
    if (!enabled) return;
    enabled = false;
    changeListener.enabled = false;
    element.removeEventListener('wheel', onWheel, false);
    element.removeEventListener('mousedown', onMouseDown, false);
    window.removeEventListener('mousemove', onMouseMove, false);
    window.removeEventListener('mouseup', onMouseUp, false);

    element.removeEventListener('touchstart', onTouchStart, false);
    window.removeEventListener('touchmove', onTouchMove, false);
    window.removeEventListener('touchend', onTouchRemoved, false)
    window.removeEventListener('touchcancel', onTouchRemoved, false)
  }

  enable();

  emitter.enable = enable;
  emitter.disable = disable;

  return emitter;
}
