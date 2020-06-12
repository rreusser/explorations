const test = require('tape');
const adaptiveSimpson = require('../scalar');
const almostEqual = require('almost-equal');

test('Adaptive Simpson\'s Method', function (t) {
  t.ok(almostEqual(adaptiveSimpson(Math.sin, 0, Math.PI, 1e-11, 8), 2), '∫ sin(x) dx ~ 2')
  t.ok(almostEqual(adaptiveSimpson(Math.sin, 0, Math.PI), 2), 'without tolerance or depth')
  t.ok(almostEqual(adaptiveSimpson(Math.sin, 0, Math.PI, 1e-11), 2), 'with tolerance specified')
  t.ok(almostEqual(adaptiveSimpson(x => x < 0 ? -1 : 1, -1, 1, 1e-2, 20), 0, 1e-6, 1e-6), 'step function')
  t.end();
});
