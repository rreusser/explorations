const nextPow2 = require('next-pow-2');

var scratch = new Float64Array(1024);
var k1, work;

module.exports = function odeRK2(out, y, f, dt, t, n) {
  var i;
  var inPlace = out === y;
  t = t === undefined ? 0 : t;
  n = n === undefined ? y.length : n;
  if (n > scratch.length) {
    scratch = new Float64Array(nextPow2(n * 2));
  }
  if (!work || work.length !== n) {
    work = scratch.subarray(0, n);
    k1 = scratch.subarray(n, 2 * n);
  }
  var w = inPlace ? work : out;
  var dt2 = dt * 0.5;

  var tmp = f(k1, y, t);
  var writesOutput = tmp !== undefined && tmp.length >= n;
  var k1tmp = writesOutput ? tmp : k1;
  for (i = 0; i < n; i++) {
    w[i] = y[i] + k1tmp[i] * dt2;
  }
  tmp = f(k1, w, t + dt2);
  k1tmp = writesOutput ? tmp : k1;
  for (i = 0; i < n; i++) {
    out[i] = y[i] + k1tmp[i] * dt;
  }

  return out;
};
