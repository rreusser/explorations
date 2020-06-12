const add = require('../add');
const test = require('tape');

test('add', function (t) {
  t.deepEqual(add.ss([], [0, 1], [4, 5]), [4, 6])
  t.deepEqual(add.sd([], [0, 1], [4, 5, 6, 7]), [4, 6, 6, 7])
  t.deepEqual(add.ds([], [0, 1, 2, 3], [4, 5]), [4, 6, 2, 3])
  t.deepEqual(add.dd([], [0, 1, 2, 3], [4, 5, 6, 7]), [4, 6, 8, 10])
  t.end();
});
