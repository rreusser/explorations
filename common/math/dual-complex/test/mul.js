const mul = require('../mul');
const test = require('tape');

test('mul', function (t) {
  var a = [1, 2, 2, 3]
  var b = [3, -5, 1, -2]
  t.deepEqual(mul.ss([], a, b), [13, 1])
  t.deepEqual(mul.sd([], a, b), [13, 1, 5, 0])
  t.deepEqual(mul.ds([], a, b), [13, 1, 21, -1])
  t.deepEqual(mul.dd([], a, b), [13, 1, 26, -1])
  t.end();
});
