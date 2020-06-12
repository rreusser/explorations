const exp = require('../exp');
const test = require('tape');

test('exp', function (t) {
  var a = [1, 2, 2, 3]
  t.deepEqual(exp.d([], a), [-1.1312043837568135, 2.4717266720048188, -9.677588783528083, 1.5498401927391967])
  t.end();
});
