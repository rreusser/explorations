const inv = require('../inv');
const test = require('tape');

test('inv', function (t) {
  var a = [1, 2]
  t.deepEqual(inv.s([], a), [0.2, -0.4])
  t.end();
});
