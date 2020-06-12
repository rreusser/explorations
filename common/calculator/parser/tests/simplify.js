const test = require('tape');
const parseExpr = require('../parse-expr').parse;
const simplify = require('../simplify');

test('simplify', function(t) {
  t.test('addition', function(t) {
    t.deepEqual(simplify(parseExpr('2 + 3i')), {
      op: 'complexvalue',
      value: [2, 3]
    });
    t.end();
  });

  t.test('multiplication', function(t) {
    t.deepEqual(simplify(parseExpr('2 * 3i')), {
      op: 'complexvalue',
      value: [0, 6]
    });

    t.end();
  });

  t.test('unary minus', function(t) {
    t.deepEqual(simplify(parseExpr('-2 * 3i')), {
      op: 'complexvalue',
      value: [0, -6]
    });

    t.end();
  });

  t.test('division', function(t) {
    t.deepEqual(simplify(parseExpr('1 / 2i')), {
      op: 'complexvalue',
      value: [0, -0.5]
    });

    t.end();
  });

  t.test('sqrt', function(t) {
    t.deepEqual(simplify(parseExpr('2 * sqrt(-3 - 4i)')), {
      op: 'complexvalue',
      value: [2, -4]
    });
    t.end();
  });

  t.test('exp', function(t) {
    t.deepEqual(simplify(parseExpr('2 * exp(-3 - 4i)')), {
      op: 'complexvalue',
      value: [-0.06508599928030957, 0.0753579551497317]
    });
    t.end();
  });
})
