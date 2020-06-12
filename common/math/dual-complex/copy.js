module.exports = {
  s: function ccopyS (out, a) {
    out[0] = a[0];
    out[1] = a[1];
    return out;
  },
  d: function ccopyD (out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    return out;
  }
}
