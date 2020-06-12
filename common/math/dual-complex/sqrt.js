module.exports = {
  s: function csqrtS (out, a) {
    var ar = a[0], ai = a[1], au = a[2], av = a[3]
    var mod = Math.hypot(ar, ai)
    var br, bi
    if (ar >= 0) {
      br = 0.5 * Math.sqrt(2 * (mod + ar))
    } else {
      br = Math.abs(ai) / Math.sqrt(2 * (mod - ar))
    }
    if (ar <= 0) {
      bi = 0.5 * Math.sqrt(2 * (mod - ar))
    } else {
      bi = Math.abs(ai) / Math.sqrt(2 * (mod + ar))
    }
    
    out[0] = br
    out[1] = bi = ai < 0 ? -bi : bi
    return out
  },
  d: function csqrtD (out, a) {
    var ar = a[0], ai = a[1], au = a[2], av = a[3]
    var mod = Math.hypot(ar, ai)
    var br, bi
    var c = Math.sqrt(2 * (mod + ar))
    var d = Math.sqrt(2 * (mod - ar))
    br = ar >= 0 ? 0.5 * c : Math.abs(ai) / d
    bi = ar <= 0 ? 0.5 * d : Math.abs(ai) / c
    bi = ai < 0 ? -bi : bi
    
    out[0] = br
    out[1] = bi
    
    var e, f;
    if (Math.abs(br) >= Math.abs(bi)) {
      e = bi / br
      f = 0.5 / (br + bi * e)
      out[2] = (au + av * e) * f
      out[3] = (av - au * e) * f
    } else {
      e = br / bi
      f = 0.5 / (br * e + bi)
      out[2] = (au * e + av) * f
      out[3] = (av * e - au) * f
    }
    
    return out
  }
};
