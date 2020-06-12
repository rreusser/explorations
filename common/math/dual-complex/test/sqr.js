const sqr = require('../sqr');
const test = require('tape');

test('sqr', function (t) {
  var a = [1, 2, 2, 3]
  t.deepEqual(sqr.s([], a), [-3, 4])
  t.deepEqual(sqr.d([], a), [-3, 4, -8, 14])
  t.end();
});
