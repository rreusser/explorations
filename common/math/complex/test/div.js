'use strict'

const test = require('tape');
const div = require('../div.js');

test('(a + bi) / (c + di)', function(t) {
  t.test('divides when abs(c) >= abs(d)', function (t) {
    const a = [4, 3];
    const b = [2, 1];

    const e = div([], a, b);

    t.ok(Math.abs(e[0] - 2.2) < 1e-8);
    t.ok(Math.abs(e[1] - 0.4) < 1e-8);
    t.end();
  })

  t.test('divides when abs(d) > abs(c)', function (t) {
    const a = [1, 2];
    const b = [3, 4];

    const e = div([], a, b)

    t.ok(Math.abs(e[0] - 0.44) < 1e-8);
    t.ok(Math.abs(e[1] - 0.08) < 1e-8);
    t.end();
  })
})
