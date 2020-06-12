var MAX_PERMITTED_DEPTH = 30;
var Sri = new Float64Array(MAX_PERMITTED_DEPTH);
var Sli = new Float64Array(MAX_PERMITTED_DEPTH);
var fbi = new Float64Array(MAX_PERMITTED_DEPTH);
var bi = new Float64Array(MAX_PERMITTED_DEPTH);
var frmi = new Float64Array(MAX_PERMITTED_DEPTH);

module.exports = function adaptiveSimpson(f, a, b, epsilon, maxDepth) {
  if (maxDepth > 30) {
    throw new Error(
      'Max depth (' +
        maxDepth +
        ') is greater than the maximum permitted depth of ' +
        MAX_PERMITTED_DEPTH
    );
  }
  epsilon = epsilon === undefined ? 1e-11 : epsilon;
  maxDepth = maxDepth === undefined ? 8 : maxDepth;
  var left, right, delta, lm, rm, flm, frm;

  // Initialize the position information. Our bitwise scheme works
  // like this: position indicates the x position in terms of an
  // integer from 0 to 2^maxDepth. Each bit can also be interpreted
  // as indicating whether we're currently on the left or right side
  // of the binary branch at the corresponding level
  var level = maxDepth;
  var depthBit = 1;
  var position;

  var h0 = b - a;
  if (h0 === 0) return 0;
  var m = 0.5 * (b + a);
  var a0 = a;
  var h6 = (b - a) / 6;
  var res = h0 / (1 << maxDepth);
  var fa = f(a);
  var fm = f(m);
  var fb = f(b);
  var S = h6 * (fa + 4 * fm + fb);

  // We only ever compare against 15 * epsilon, so just premultiply
  epsilon *= 15;

  while (true) {
    h6 = (b - a) * (0.5 / 6);
    lm = 0.5 * (a + m);
    rm = 0.5 * (m + b);
    flm = f(lm);
    frm = f(rm);
    left = h6 * (fa + 4 * flm + fm);
    right = h6 * (fm + 4 * frm + fb);
    delta = left + right - S;

    if (level === 0 || Math.abs(delta) * depthBit <= epsilon) {
      // If we're not recursing down, either because we're at the max depth
      // or because the tolerance is met,then this section is an aggregation
      // of the values we computed before with the value we just computed.
      // We terminate as soon as we can step right rather than continuing
      // to aggregate upward.
      var sum = left + right + delta * 0.066666666666666667;
      while (true) {
        if (position & (1 << level)) {
          // Step up
          position ^= 1 << level;
          depthBit >>>= 1;
          sum += Sli[level];
          level++;
          fb = fbi[level];
          fm = fb;
          m = b;
          b = bi[level];
          continue;
        }
        if (level === maxDepth) return sum;
        // Step right
        position ^= 1 << level;
        a = b;
        //b = a0 + res * (position + (1 << level))
        fa = fb;
        // Restore from values we computed on the way down
        b = bi[level + 1];
        fb = fbi[level + 1];
        fm = frmi[level + 1];
        S = Sri[level + 1];
        m = 0.5 * (a + b);
        // Store the sum for aggregation on the way back up
        Sli[level] = sum;
        break;
      }
      continue;
    }

    // Step down
    // Store values for use on the way back up
    bi[level] = b;
    fbi[level] = fb;
    Sri[level] = right;
    frmi[level] = frm;
    depthBit <<= 1;
    level--;
    b = m;
    m = lm;
    fb = fm;
    fm = flm;
    S = left;
  }
};
