const h = require('h');

const LOG2INV = 1.0 / Math.log(2);

module.exports = function (element, opts) {
  opts = opts || {};
  const resolutionFactor = opts.resolutionFactor || 10;
  const timeConstant = (opts.timeConstant * 1000) || 100;
  const decayExponent = -LOG2INV / timeConstant;
  const tmin = opts.tmin || 0.0;
  const tmax = opts.tmax || 1.0;
  var onUpdate;

  function getPosition () {
    return window.scrollY / (element.offsetHeight - window.innerHeight);
  }

  function truncate (value) {
    var height = element.offsetHeight;
    return Math.round(value * height * resolutionFactor) / height / resolutionFactor;
  }

  var position = getPosition();
  var tPrev = 0;
  var truncatedPosition = truncate(position);
  var raf;
  var initialized = false;

  function onRaf (t) {
    const dt = t - tPrev;

    if (tPrev !== undefined) {
      var decayFactor = Math.exp(dt * decayExponent);
      position *= decayFactor;
      position += (1.0 - decayFactor) * getPosition();
    }

    var newTruncatedPosition = truncate(position);

    if (newTruncatedPosition !== truncatedPosition || !initialized) {
      if (onUpdate) {
        onUpdate(tmin + (tmax - tmin) * newTruncatedPosition);
        initialized = true;
      }

      truncatedPosition = newTruncatedPosition;
    }

    raf = requestAnimationFrame(onRaf);
    tPrev = t;
  }

  function start () {
    if (raf !== undefined) return;
    raf = requestAnimationFrame(onRaf);
    return self;
  }

  function stop () {
    if (raf === undefined) return;
    cancelAnimationFrame(raf);
    raf = undefined;
    return self;
  }

  requestAnimationFrame(start);

  const self = {
    onUpdate: function (callback) {
      onUpdate = callback;
      return self;
    },
    start: start,
    stop: stop
  };

  return self;
};
