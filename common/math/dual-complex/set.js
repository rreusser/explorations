module.exports = {
  s: function csetValuesS (out, a, b) {
    out[0] = a;
    out[1] = b;
    return out;
  },
  d: function csetValuesD (out, a, b, c, d) {
    out[0] = a;
    out[1] = b;
    out[2] = c;
    out[3] = d;
    return out;
  }
};
