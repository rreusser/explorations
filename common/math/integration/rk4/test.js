const test = require('tape');
const odeRK4 = require('./');
const arrayAlmostEqual = require('../../../util/array-almost-equal');

test('Fourth order Runge-Kutta', function (test) {
  test.test('y\' = t √y with y(0) = 1 integrated from t = 0 to t = 1', function (test) {
    var y = [1]
    var t = 0
    var steps = 50
    var dt = 1 / steps
    for (var i = 0; i < steps; i++) {
      odeRK4(y, y, (_, y, t) => [t * Math.sqrt(y[0])], dt, t)
      t += dt
    }
    test.ok(arrayAlmostEqual(y, [25 / 16], 1e-8), 'in-place output with f that returns a new array ~ 25 / 16')
    
    y = [1]
    t = 0
    for (i = 0; i < steps; i++) {
      odeRK4(y, y, (out, y, t) => {out[0] = t * Math.sqrt(y[0])}, dt, t)
      t += dt
    }
    test.ok(arrayAlmostEqual(y, [25 / 16], 1e-8), 'in-place output with f that writes to a derivative function ~ 25 / 16')
    
    var out = [1]
    y = [1]
    t = 0
    for (i = 0; i < steps; i++) {
      y[0] = out[0]
      odeRK4(out, y, (out, y, t) => {out[0] = t * Math.sqrt(y[0])}, dt, t)
      t += dt
    }
    test.ok(arrayAlmostEqual(out, [25 / 16], 1e-8), 'f that writes to a derivative function ~ 25 / 16')
    
    out = [1]
    y = [1]
    var t = 0
    var steps = 50
    var dt = 1 / steps
    for (var i = 0; i < steps; i++) {
      y[0] = out[0]
      odeRK4(out, y, (_, y, t) => [t * Math.sqrt(y[0])], dt, t)
      t += dt
    }
    test.ok(arrayAlmostEqual(out, [25 / 16], 1e-8), 'f that returns a new array ~ 25 / 16')

    test.end();
  })
})
