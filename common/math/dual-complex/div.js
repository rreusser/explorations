module.exports = {
  ss: function cdivSS (out, a, b) {
    var ar = a[0], ai = a[1]
    var br = b[0], bi = b[1]
    var e, f;
    if (Math.abs(br) >= Math.abs(bi)) {
      e = bi / br
      f = 1 / (br + bi * e)
      out[0] = (ar + ai * e) * f
      out[1] = (ai - ar * e) * f
    } else {
      e = br / bi
      f = 1 / (br * e + bi)
      out[0] = (ar * e + ai) * f
      out[1] = (ai * e - ar) * f
    }
    return out
  },
  sd: function cdivSD (out, a, b) {
    var ar = a[0], ai = a[1]
    var br = b[0], bi = b[1], dbr = b[2], dbi = b[3]
    var aobr, aobi
    var e, f
    var r = Math.abs(br) >= Math.abs(bi)
    if (r) {
      e = bi / br
      f = 1 / (br + bi * e)
      out[0] = aobr = (ar + ai * e) * f
      out[1] = aobi = (ai - ar * e) * f
    } else {
      e = br / bi
      f = 1 / (br * e + bi)
      out[0] = aobr = (ar * e + ai) * f
      out[1] = aobi = (ai * e - ar) * f
    }
    
    // Compute the differential - a * db / b^2 but instead as
    // -((a / b) * db) / b
    var numr = aobr * dbr - aobi * dbi
    var numi = aobr * dbi + aobi * dbr
    
    if (r) {
      e = bi / br
      f = 1 / (br + bi * e)
      out[2] = -(numr + numi * e) * f
      out[3] = -(numi - numr * e) * f
    } else {
      e = br / bi
      f = 1 / (br * e + bi)
      out[2] = -(numr * e + numi) * f
      out[3] = -(numi * e - numr) * f
    }
    return out
  },
  ds: function cdivDS (out, a, b) {
    var ar = a[0], ai = a[1], dar = a[2], dai = a[3]
    var br = b[0], bi = b[1]
    var aobr, aobi
    var e, f
    var r = Math.abs(br) >= Math.abs(bi)
    if (r) {
      e = bi / br
      f = 1 / (br + bi * e)
      out[0] = aobr = (ar + ai * e) * f
      out[1] = aobi = (ai - ar * e) * f
    } else {
      e = br / bi
      f = 1 / (br * e + bi)
      out[0] = aobr = (ar * e + ai) * f
      out[1] = aobi = (ai * e - ar) * f
    }
    
    // Compute the differential da / b
    if (r) {
      e = bi / br
      f = 1 / (br + bi * e)
      out[2] = (dar + dai * e) * f
      out[3] = (dai - dar * e) * f
    } else {
      e = br / bi
      f = 1 / (br * e + bi)
      out[2] = (dar * e + dai) * f
      out[3] = (dai * e - dar) * f
    }
    return out
  },
  dd: function cdivDD (out, a, b) {
    var ar = a[0], ai = a[1], au = a[2], av = a[3]
    var br = b[0], bi = b[1], bu = b[2], bv = b[3]
    var aobr, aobi
    var e, f
    var r = Math.abs(br) >= Math.abs(bi)
    if (r) {
      e = bi / br
      f = 1 / (br + bi * e)
      out[0] = aobr = (ar + ai * e) * f
      out[1] = aobi = (ai - ar * e) * f
    } else {
      e = br / bi
      f = 1 / (br * e + bi)
      out[0] = aobr = (ar * e + ai) * f
      out[1] = aobi = (ai * e - ar) * f
    }
    
    // Compute the differential (b * da - a * db) / b^2 but instead as
    // (da - (a / b) * db) / b so that we use the result we've already
    // computed and avoid floating point overflow
    var numr = au - aobr * bu + aobi * bv
    var numi = av - aobr * bv - aobi * bu
    
    if (r) {
      e = bi / br
      f = 1 / (br + bi * e)
      out[2] = (numr + numi * e) * f
      out[3] = (numi - numr * e) * f
    } else {
      e = br / bi
      f = 1 / (br * e + bi)
      out[2] = (numr * e + numi) * f
      out[3] = (numi * e - numr) * f
    }
    return out
  }
};
