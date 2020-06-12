module.exports = {
  s: function csqrS (out, a) {
    var ar = a[0]
    var ai = a[1]
    out[0] = ar * ar - ai * ai
    out[1] = 2.0 * ar * ai
    return out
  },
  d: function csqrD (out, a) {
    var ar = a[0], ai = a[1], au = a[2], av = a[3]
    out[0] = ar * ar - ai * ai
    out[1] = 2 * ar * ai
    out[2] = 2 * (ar * au - ai * av)
    out[3] = 2 * (ar * av + ai * au)
    return out;
  }
};
