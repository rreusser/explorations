module.exports = {
  ss: function cmulSS (out, a, b) {
    var ar = a[0], ai = a[1]
    var br = b[0], bi = b[1]
    out[0] = ar * br - ai * bi
    out[1] = ar * bi + ai * br
    return out
  },
  sd: function cmulSD (out, a, b) {
    var ar = a[0], ai = a[1]
    var br = b[0], bi = b[1], bu = b[2], bv = b[3]
    out[0] = ar * br - ai * bi
    out[1] = ar * bi + ai * br
    out[2] = ar * bu - ai * bv
    out[3] = ar * bv + ai * bu
    return out;
  },
  ds: function cmulDS (out, a, b) {
    var ar = a[0], ai = a[1], au = a[2], av = a[3]
    var br = b[0], bi = b[1]
    out[0] = ar * br - ai * bi
    out[1] = ar * bi + ai * br
    out[2] = au * br - av * bi
    out[3] = au * bi + av * br
    return out;
  },
  dd: function cmulDD (out, a, b) {
    var ar = a[0], ai = a[1], dar = a[2], av = a[3]
    var br = b[0], bi = b[1], bu = b[2], bv = b[3]
    out[0] = ar * br - ai * bi;
    out[1] = ar * bi + ai * br;
    out[2] = ar * bu - ai * bv + dar * br - av * bi;
    out[3] = ar * bv + ai * bu + dar * bi + av * br;
    return out;
  }
};
