module.exports = function binarySearch(x, value) {
  let lo = 0,
    hi = x.length - 1;
  if (value <= x[0]) return lo;
  if (value >= x[hi]) return hi;
  while (lo < hi - 1) {
    let m = ((lo + hi) / 2) | 0;
    let xm = x[m];
    if (xm > value) {
      hi = m;
    } else if (xm < value) {
      lo = m;
    } else {
      return m;
    }
  }
  return lo;
}
