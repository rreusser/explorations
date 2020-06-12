module.exports = {
  d: function csinhcoshD (sinhOut, coshOut, a) {
    var ar = a[0], ai = a[1], dar = a[2], dai = a[3]
    var e = Math.exp(ar)
    var c = 0.5 * Math.cos(ai)
    var s = 0.5 * Math.sin(ai)
    var epr = c * e
    var epi = s * e
    var emr = c / e
    var emi = -s / e
    var epu = epr * dar - epi * dai
    var epv = epr * dai + epi * dar
    var emu = emr * dar - emi * dai
    var emv = emr * dai + emi * dar
    var sr = sinhOut[0] = epr - emr
    var si = sinhOut[1] = epi - emi
    var cr = coshOut[0] = epr + emr
    var ci = coshOut[1] = epi + emi
    sinhOut[2] = cr * dar - ci * dai
    sinhOut[3] = cr * dai + ci * dar
    coshOut[2] = sr * dar - si * dai
    coshOut[3] = sr * dai + si * dar
  }
};
