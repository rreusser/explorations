const almostEqual = require('almost-equal');

module.exports = function arrayAlmostEqual (a, b, absoluteError, relativeError) {
  if (a.length !== b.length) return false
  for (var i = 0; i < a.length; i++) {
    if (!almostEqual(a[i], b[i], absoluteError, relativeError)) return false
  }
  return true
}
