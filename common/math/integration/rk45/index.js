const nextPow2 = require('next-pow-2');
const EPSILON = 2.220446049250313e-16;

function minMag(a, b) {
  return (a > 0 ? Math.min : Math.max)(a, b);
}

function maxMag(a, b) {
  return (a > 0 ? Math.max : Math.min)(a, b);
}

var scratch = new Float64Array(1024);
var k1tmp, k2tmp, k3tmp, k4tmp, k5tmp, k6tmp, w;

module.exports = function ode45(outputState, inputState, f, options) {
  if (typeof f !== 'function') {
    options = f;
    f = inputState;
    inputState = outputState;
  }
  var i, tmp, k1, k2, k3, k4, k5, k6;
  options = options || {};
  var out = outputState || {};

  var tolerance = options.tolerance === undefined ? 1e-8 : +options.tolerance;
  let tolerance2 = tolerance * tolerance;
  var maxIncreaseFactor =
    options.maxIncreaseFactor === undefined ? 10 : options.maxIncreaseFactor;
  var maxDecreaseFactor =
    options.maxDecreaseFactor === undefined ? 10 : options.maxDecreaseFactor;
  var tLimit =
    options.tLimit === undefined
      ? inputState.dt > 0.0
        ? Infinity
        : -Infinity
      : options.tLimit;

  var safetyFactor = 0.9;
  var y = inputState.y;
  var n = y.length;
  var dt = inputState.dt === undefined ? 1.0 : +inputState.dt;
  var t = inputState.t === undefined ? 0.0 : +inputState.t;
  if (out.y === undefined) {
    out.y = new Float64Array(n);
  }
  var yOut = out.y;
  var inPlace = yOut === y;

  if (n * 7 > scratch.length) {
    scratch = new Float64Array(nextPow2(n * 7));
  }
  if (!w || w.length !== n) {
    w = scratch.subarray(0, n);
    k1tmp = scratch.subarray(1 * n, 2 * n);
    k2tmp = scratch.subarray(2 * n, 3 * n);
    k3tmp = scratch.subarray(3 * n, 4 * n);
    k4tmp = scratch.subarray(4 * n, 5 * n);
    k5tmp = scratch.subarray(5 * n, 6 * n);
    k6tmp = scratch.subarray(6 * n, 7 * n);
  }

  // Values from the Butcher tableau:
  // var a21 =  0.200000000000000000 // 1/5
  // var a31 =  0.075000000000000000 // 3/40
  // var a32 =  0.225000000000000000 // 9/40
  // var a41 =  0.300000000000000000 // 3/10
  // var a42 = -0.900000000000000000 // -9/10
  // var a43 =  1.200000000000000000 // 6/5
  // var a51 = -0.203703703703703703 // -11/54
  // var a52 =  2.500000000000000000 // 5/2
  // var a53 = -2.592592592592592592 // -70/27
  // var a54 =  1.296296296296296296 // 35/27
  // var a61 =  0.029495804398148148 // 1631/55296
  // var a62 =  0.341796875000000000 // 175/512
  // var a63 =  0.041594328703703703 // 575/13824
  // var a64 =  0.400345413773148148 // 44275/110592
  // var a65 =  0.061767578125000000 // 253/4096

  // var b1  =  0.000000000000000000 // 0
  // var b2  =  0.200000000000000000 // 1/5
  // var b3  =  0.300000000000000000 // 3/10
  // var b4  =  0.600000000000000000 // 3/5
  // var b5  =  1.000000000000000000 // 1
  // var b6  =  0.875000000000000000 // 7/8

  // Same for every step, so don't repeat:

  var w = inPlace ? w : out;

  tmp = f(k1tmp, y, t);
  var returnsOutput = tmp !== undefined && tmp.length >= n;
  k1 = returnsOutput ? tmp : k1tmp;

  var limitReached = false;
  var trialStep = 0;
  var thisDt = dt;
  while (true && trialStep++ < 1000) {
    thisDt = minMag(thisDt, tLimit - t);

    for (i = 0; i < n; i++) {
      w[i] = y[i] + thisDt * (0.2 * k1[i]);
    }

    tmp = f(k2tmp, w, t + dt * 0.2);
    k2 = returnsOutput ? tmp : k2tmp;

    for (i = 0; i < n; i++) {
      w[i] = y[i] + thisDt * (0.075 * k1[i] + 0.225 * k2[i]);
    }
    tmp = f(k3tmp, w, t + thisDt * 0.3);
    k3 = returnsOutput ? tmp : k3tmp;

    for (i = 0; i < n; i++) {
      w[i] = y[i] + thisDt * (0.3 * k1[i] + -0.9 * k2[i] + 1.2 * k3[i]);
    }

    tmp = f(k4tmp, w, t + thisDt * 0.6);
    k4 = returnsOutput ? tmp : k4tmp;

    for (i = 0; i < n; i++) {
      w[i] =
        y[i] +
        thisDt *
          (-0.203703703703703703 * k1[i] +
            2.5 * k2[i] +
            -2.592592592592592592 * k3[i] +
            1.296296296296296296 * k4[i]);
    }

    tmp = f(k5tmp, w, t + thisDt);
    var k5 = returnsOutput ? tmp : k5tmp;

    for (i = 0; i < n; i++) {
      w[i] =
        y[i] +
        thisDt *
          (0.029495804398148148 * k1[i] +
            0.341796875 * k2[i] +
            0.041594328703703703 * k3[i] +
            0.400345413773148148 * k4[i] +
            0.061767578125 * k5[i]);
    }

    tmp = f(k6tmp, w, t + thisDt * 0.875);
    var k6 = returnsOutput ? tmp : k6tmp;

    // Compute error:
    //var cs1 =  0.102177372685185185 // 2825/27648
    //var cs2 =  0.000000000000000000 // 0
    //var cs3 =  0.383907903439153439 // 18575/48384
    //var cs4 =  0.244592737268518518 // 13525/55296
    //var cs5 =  0.019321986607142857 // 277/14336
    //var cs6 =  0.250000000000000000 // 1/4

    //var dc1 =  0.004293774801587301 // cs1 - c1
    //var dc2 =  0.000000000000000000 // cs2 - c2
    //var dc3 = -0.018668586093857832 // cs3 - c3
    //var dc4 =  0.034155026830808080 // cs4 - c4
    //var dc5 =  0.019321986607142857 // cs5 - c5
    //var dc6 = -0.039102202145680406 // cs6 - c6

    var error2 = 0;
    for (var i = 0; i < n; i++) {
      let d =
        thisDt *
        (0.004293774801587301 * k1[i] +
          -0.018668586093857832 * k3[i] +
          0.034155026830808080 * k4[i] +
          0.019321986607142857 * k5[i] +
          -0.039102202145680406 * k6[i]);
      error2 += d * d;
    }

    if (error2 < tolerance2 || thisDt === 0.0) {
      break;
    }

    var nextDt = safetyFactor * thisDt * Math.pow(tolerance2 / error2, 0.1);
    thisDt = maxMag(thisDt / maxDecreaseFactor, nextDt);
  }

  // Perform the final update
  // var c1 = 0.097883597883597883 // 37/378
  // var c2 = 0.000000000000000000 // 0
  // var c3 = 0.402576489533011272 // 250/621
  // var c4 = 0.210437710437710437 // 125/594
  // var c5 = 0.000000000000000000 // 0
  // var c6 = 0.289102202145680406 // 512/1771

  for (var i = 0; i < n; i++) {
    y[i] +=
      thisDt *
      (0.097883597883597883 * k1[i] +
        0.402576489533011272 * k3[i] +
        0.210437710437710437 * k4[i] +
        0.289102202145680406 * k6[i]);
  }
  var previousDt = thisDt;
  out.t += thisDt;

  // Update dt for the next step (grow a bit if possible)
  nextDt = safetyFactor * thisDt * Math.pow(tolerance2 / error2, 0.125);
  out.dt = maxMag(
    thisDt / maxDecreaseFactor,
    minMag(thisDt * maxIncreaseFactor, nextDt)
  );
  out.dtPrevious = thisDt;
  out.limitReached =
    isFinite(tLimit) &&
    Math.abs((out.t - options.tLimit) / previousDt) < EPSILON;

  return out;
}
