const cmod = require('../complex/cmod');
const cdiv = require('../complex/cdiv');

var tmp = [0, 0, 0, 0];

module.exports = function(out, f, z0, tolerance, maxIterations, verbose) {
  maxIterations = maxIterations === undefined ? 50 : maxIterations;
  tolerance = tolerance === undefined ? 1e-5 : tolerance;
  out[0] = z0[0];
  out[1] = z0[1];
  const z = [z0[0], z0[1]];

  var iteration = maxIterations;
  var delta = 1;
  var previousDelta = 0;
  var error = Infinity;

  const y = [0, 0];
  const dy = [0, 0];

  while (error > tolerance && --iteration > 0) {
    // Evaluate function and its derivative
    f(y, dy, z);

    // y / y'
    cdiv(tmp, y, dy);

    // Update
    z[0] -= tmp[0];
    z[1] -= tmp[1];

    delta = cmod(tmp);
    error = Math.abs(delta / previousDelta);
    previousDelta = delta;
  }

  if (iteration === 0 && error > tolerance) {
    if (verbose)
      console.warn(
        'Newton-Raphson failed to converge after ' +
          maxIterations +
          ' iterations'
      );
    out[0] = z0[0];
    out[1] = z0[1];
  } else {
    out[0] = z[0];
    out[1] = z[1];
  }

  return out;
};
