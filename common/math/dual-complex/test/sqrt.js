const sqrt = require('../sqrt');
const test = require('tape');

test('sqrt', function (t) {
  var a = [1, 2, 2, 3]
  t.deepEqual(sqrt.s([], a), [1.272019649514069, 0.7861513777574233])
  t.deepEqual(sqrt.d([], a), [1.272019649514069, 0.7861513777574233, 1.0962308573869974, 0.5017191372545318])
  t.end();
});
