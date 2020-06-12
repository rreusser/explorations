const h = require('h');
const cubicInOut = require('eases/cubic-in-out');
const vec3Lerp = require('gl-vec3/lerp');
const vec4Lerp = require('gl-vec4/lerp');

module.exports = function (stateVars, onStateChange) {
  var stateVarNames = Object.keys(stateVars);

  function interpolate (value0, value1, interpolant) {
    switch(value0.length) {
      case undefined:
        return (1.0 - interpolant) * value0 + interpolant * value1;
      case 2:
        return vec2Lerp([], value0, value1, interpolant);
      case 3:
        return vec3Lerp([], value0, value1, interpolant);
      case 4:
        return vec4Lerp([], value0, value1, interpolant);
    }
  }

  var state = {};
  var changed = {};
  function computeState (t) {
    var newValue;
    var hasChanges = false;

    for (var i = 0; i < stateVarNames.length; i++) {
      var stateVarName = stateVarNames[i];
      var stateVar = stateVars[stateVarName];
      var steps = Array.isArray(stateVar) ? stateVar : stateVar.steps;
      changed[stateVarName] = false;

      var stepFrom = steps[0];
      for (var j = 0; j < steps.length; j++) {
        var stepTo = steps[j];
        if (t < stepTo.t) break;
        stepFrom = stepTo;
      }

      if (stepFrom === stepTo) {
        newValue = stepFrom.value;
      } else {
        newValue = (stateVar.interpolate || interpolate)(
          stepFrom.value,
          stepTo.value,
          (stepTo.ease || cubicInOut)((t - stepFrom.t) / (stepTo.t - stepFrom.t))
        );
      }

      if (newValue !== state[stateVarName]) {
        changed[stateVarName] = true;
        hasChanges = true;
        state[stateVarName] = newValue;
      }
    }

    return hasChanges;
  }

  var currentPosition = 0;
  computeState(currentPosition);

  const self = {
    setPosition: function (t) {
      currentPosition = t;
      var hasChanges = computeState(t);
      if (hasChanges) {
        onStateChange && onStateChange(state, changed);
      }
      return self;
    },
    getPosition: function () {
      return currentPosition;
    },
    getState: function () {
      return state;
    }
  };

  return self;
};
