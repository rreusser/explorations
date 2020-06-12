const test = require('tape');
const almostEqual = require('almost-equal');
const arrayAlmostEqual = require('../../../util/array-almost-equal');
const ode45 = require('./');

test('Runge-Kutta order 5(4)', function (test) {
  test.test('y\' = [y1, -y0] integrated from t = 0 to t = 2π', function (test) {
    var state = {
      y: [1, 0],
      t: 0,
      dt: 1.0,
    };
    var options = {
      tLimit: Math.PI * 2.0,
      tolerance: 1e-8,
    }

    while (options.tLimit - state.t) {
      ode45(state, state, (out, y, t) => {
        out[0] = y[1]
        out[1] = -y[0]
      }, options)
    }
    
    test.ok(almostEqual(state.t, Math.PI * 2), 'integrated to 2π')
    test.ok(arrayAlmostEqual(state.y, [1, 0], 1e-7), 'y(t=2π) ~ [1, 0]')

    test.end();
  })
})
