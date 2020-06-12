module.exports = {
  s: function cexpS (out, a) {
    var ai = a[1]
    var e = Math.exp(a[0])
    out[0] = e * Math.cos(ai)
    out[1] = e * Math.sin(ai)
    return out
  },
  d: function cexpD (out, a) {
    var ar = a[0], ai = a[1], au = a[2], av = a[3]
    var e = Math.exp(ar)
    var re = e * Math.cos(ai)
    var im = e * Math.sin(ai)
    out[0] = re
    out[1] = im
    out[2] = re * au - im * av
    out[3] = re * av + im * au
    return out
  }
};
