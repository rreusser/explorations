const test = require('tape');
const findRoot = require('./');

test('complex-newton-raphson', function (t) {
  const root = findRoot([], function (y, dy, z) {
    y[0] = z[0] - 5;
    y[1] = z[1] - 2;

    dy[0] = 1;
    dy[1] = 0;
  }, [8, 2])

  t.deepEqual(root, [5, 2]);

  t.end();
});
