const mul = require('../mul');
const test = require('tape');

test('mul', function (t) {
  var a = [1, 2, 2, 3]
  var b = [3, -5, 1, -2]
  t.deepEqual(mul([], a, b), [13, 1])
  t.end();
});
