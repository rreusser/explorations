const test = require('tape');
const vectorAdaptiveSimpson = require('../vector');
const arrayAlmostEqual = require('../../../../util/array-almost-equal');
const almostEqual = require('almost-equal');

test('Vector Adaptive Simpson\'s Method', t => {
  t.ok(almostEqual(
    vectorAdaptiveSimpson([], (out, x) => {
      out[0] = Math.sin(x)
    }, 0, Math.PI, 1e-11, 8, 1)[0], 2),
    '∫_0^π [sin(x)] dx ~ [2]'
  )

  t.ok(arrayAlmostEqual(
      vectorAdaptiveSimpson([], (out, x) => {
        out[0] = Math.sin(x)
        out[1] = Math.cos(x)
      }, 0, Math.PI, 1e-11, 8, 2),
      [2, 0]
    ),
    '∫_0^π [sin(x), cos(x)] dx ~ [2, 0]'
  )

  t.ok(arrayAlmostEqual(
      vectorAdaptiveSimpson([], (out, x) => {
        out[0] = Math.cos(x)
        out[1] = Math.sin(x)
      }, 0, Math.PI, 1e-11, 8, 2),
      [0, 2]
    ),
    '∫_0^π [cos(x), sin(x)] dx ~ [0, 2]'
  )

  t.ok(arrayAlmostEqual(
    vectorAdaptiveSimpson([], (out, t) => {out[0] = Math.sin(t); out[1] = Math.cos(t)}, 0, Math.PI, undefined, undefined, 2),
    [2, 0]
  ), 'with result output, a dimension, and a function which writes to out')

  t.ok(arrayAlmostEqual(
    vectorAdaptiveSimpson([], (out, t) => {out[0] = Math.sin(t); out[1] = Math.cos(t)}, 0, Math.PI),
    [2, 0]
  ), 'with result output and a function which writes to out')

  t.ok(arrayAlmostEqual(
    vectorAdaptiveSimpson((out, t) => {out[0] = Math.sin(t); out[1] = Math.cos(t)}, 0, Math.PI),
    [2, 0]
  ), 'with no output and a function which writes to out')

  t.ok(arrayAlmostEqual(
    vectorAdaptiveSimpson(t => [Math.sin(t), Math.cos(t)], 0, Math.PI),
    [2, 0]
  ), 'with no output and a function which outputs directly')

  t.ok(arrayAlmostEqual(
    vectorAdaptiveSimpson([], t => [Math.sin(t), Math.cos(t)], 0, Math.PI),
    [2, 0]
  ), 'with output and a function which outputs directly')

  t.ok(arrayAlmostEqual(
    vectorAdaptiveSimpson([], t => [Math.sin(t), Math.cos(t)], 0, Math.PI, undefined, undefined, 2),
    [2, 0]
  ), 'with output, a dimension, and a function which outputs directly')

  t.end();
});
