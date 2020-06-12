module.exports = {
  s: function cscaleS (out, a, s) {
    out[0] = a[0] * s;
    out[1] = a[1] * s;
    return out;
  },
  d: function cscaleD (out, a, s) {
    out[0] = a[0] * s;
    out[1] = a[1] * s;
    out[2] = a[2] * s;
    out[3] = a[3] * s;
    return out;
  }
};
