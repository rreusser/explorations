const test = require('tape');
const parseExpr = require('../parse-expr').parse;

console.log(parseExpr);

test('parse', function(t) {
  t.test('+', function(t) {
    t.deepEqual(parseExpr('5 + 4'), {
      op: 'add',
      operands: [{ op: 'realvalue', value: 5 }, { op: 'realvalue', value: 4 }]
    });
    t.end();
  });

  t.test('-', function(t) {
    t.deepEqual(parseExpr('5 - 4'), {
      op: 'sub',
      operands: [{ op: 'realvalue', value: 5 }, { op: 'realvalue', value: 4 }]
    });
    t.end();
  });

  t.test('^', function(t) {
    t.deepEqual(parseExpr('z^3'), {
      op: 'pow',
      operands: [{ op: 'variable', name: 'z' }, { op: 'realvalue', value: 3 }]
    });
    t.end();
  });

  t.test('*', function(t) {
    t.deepEqual(parseExpr('5 * 4'), {
      op: 'mul',
      operands: [{ op: 'realvalue', value: 5 }, { op: 'realvalue', value: 4 }]
    });
    t.end();
  });

  t.test('/', function(t) {
    t.deepEqual(parseExpr('5 / 4'), {
      op: 'div',
      operands: [{ op: 'realvalue', value: 5 }, { op: 'realvalue', value: 4 }]
    });
    t.end();
  });

  t.test('i', function(t) {
    t.deepEqual(parseExpr('5i'), { op: 'imagvalue', value: 5 });
    t.deepEqual(parseExpr('5.0i'), { op: 'imagvalue', value: 5 });
    t.end();
  });

  t.test('^', function(t) {
    t.deepEqual(parseExpr('5 ^ 4i'), {
      op: 'pow',
      operands: [{ op: 'realvalue', value: 5 }, { op: 'imagvalue', value: 4 }]
    });
    t.end();
  });

  t.test('**', function(t) {
    t.deepEqual(parseExpr('5 ** 4i'), {
      op: 'pow',
      operands: [{ op: 'realvalue', value: 5 }, { op: 'imagvalue', value: 4 }]
    });
    t.end();
  });

  t.test('function', function(t) {
    t.deepEqual(parseExpr('sin(5)'), {
      op: 'function',
      name: 'sin',
      operands: [{ op: 'realvalue', value: 5 }]
    });
    t.end();
  });

  t.test('binary function', function(t) {
    t.deepEqual(parseExpr('pow(5, 4i)'), {
      op: 'function',
      name: 'pow',
      operands: [{ op: 'realvalue', value: 5 }, { op: 'imagvalue', value: 4 }]
    });
    t.end();
  });

  t.test('newlines', function(t) {
    t.deepEqual(parseExpr('2 \n+\n 3'), {
      op: 'add',
      operands: [{ op: 'realvalue', value: 2 }, { op: 'realvalue', value: 3 }]
    });
    t.end();
  });

  t.test('imaginary values', function(t) {
    t.deepEqual(parseExpr('2 + 3i'), {
      op: 'add',
      operands: [{ op: 'realvalue', value: 2 }, { op: 'imagvalue', value: 3 }]
    });
    t.end();
  });

  t.test('variables', function(t) {
    t.deepEqual(parseExpr('2 * foo + 4'), {
      op: 'add',
      operands: [
        {
          op: 'mul',
          operands: [
            { op: 'realvalue', value: 2 },
            { op: 'variable', name: 'foo' }
          ]
        },
        { op: 'realvalue', value: 4 }
      ]
    });
    t.end();
  });
})
