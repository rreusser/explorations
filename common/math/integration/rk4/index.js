const nextPow2 = require('next-pow-2');

var scratch = new Float64Array(1024);
var k1, k2, k3, k4, work;

module.exports = function odeRK4(out, y, f, dt, t, n) {
  var i;
  var inPlace = out === y;
  t = t === undefined ? 0 : t;
  n = n === undefined ? y.length : n;
  if (n > scratch.length) {
    scratch = new Float64Array(nextPow2(n * 5));
  }
  if (!work || work.length !== n) {
    work = scratch.subarray(0, n);
    k1 = scratch.subarray(1 * n, 2 * n);
    k2 = scratch.subarray(2 * n, 3 * n);
    k3 = scratch.subarray(3 * n, 4 * n);
    k4 = scratch.subarray(4 * n, 5 * n);
  }
  var w = inPlace ? work : out;
  var dt6 = dt / 6.0;

  var tmp = f(k1, y, t);
  var returnsOutput = tmp !== undefined && tmp.length >= n;
  var k1tmp = returnsOutput ? tmp : k1;
  for (i = 0; i < n; i++) {
    w[i] = y[i] + k1tmp[i] * dt * 0.5;
  }
  tmp = f(k2, w, t + dt * 0.5);
  var k2tmp = returnsOutput ? tmp : k2;
  for (i = 0; i < n; i++) {
    w[i] = y[i] + k2tmp[i] * dt * 0.5;
  }
  tmp = f(k3, w, t + dt * 0.5);
  var k3tmp = returnsOutput ? tmp : k3;
  for (i = 0; i < n; i++) {
    w[i] = y[i] + k3tmp[i] * dt;
  }
  tmp = f(k4, w, t + dt);
  var k4tmp = returnsOutput ? tmp : k4;
  for (i = 0; i < n; i++) {
    out[i] = y[i] + dt6 * (k1tmp[i] + k4tmp[i] + 2 * (k2tmp[i] + k3tmp[i]));
  }

  return out;
};
