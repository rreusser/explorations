const sinhcosh = require('../sinhcosh');
const test = require('tape');

test('sinhcosh', function (t) {
  var a = [1, 2, 2, 3]
  var sinh = []
  var cosh = []
  sinhcosh.d(sinh, cosh, a)
  t.deepEqual(sinh, [-0.48905625904129363, 1.4031192506220405, -4.490118513579374, 0.21077046861899662])
  t.deepEqual(cosh, [-0.64214812471552, 1.0686074213827783, -5.187470269948708, 1.3390697241202])
  t.end();
});
