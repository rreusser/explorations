const sub = require('../sub');
const test = require('tape');

test('sub', function (t) {
  t.deepEqual(sub.ss([], [0, 1], [4, 5]), [-4, -4])
  t.deepEqual(sub.sd([], [0, 1], [4, 5, 6, 7]), [-4, -4, -6, -7])
  t.deepEqual(sub.ds([], [0, 1, 2, 3], [4, 5]), [-4, -4, 2, 3])
  t.deepEqual(sub.dd([], [0, 1, 2, 3], [4, 5, 6, 7]), [-4, -4, -4, -4])
  t.end();
});
