module.exports = {
  ss: function csubSS (out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    return out;
  },
  sd: function csubSD (out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = -b[2];
    out[3] = -b[3];
    return out;
  },
  ds: function csubDS (out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2];
    out[3] = a[3];
    return out;
  },
  dd: function csubDD (out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    out[3] = a[3] - b[3];
    return out;
  }
};
