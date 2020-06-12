module.exports = {
  s: function cinvS (out, b) {
    var br = b[0], bi = b[1]
    var e, f;
    if (Math.abs(br) >= Math.abs(bi)) {
      e = bi / br
      f = 1 / (br + bi * e)
      out[0] = f
      out[1] = -e * f
    } else {
      e = br / bi
      f = 1 / (br * e + bi)
      out[0] = e * f
      out[1] = -f
    }
    return out
  }
};
