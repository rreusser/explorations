module.exports = function cdiv (out, a, b) {
  let e, f;
  const ar = a[0];
  const ai = a[1];
  const br = b[0];
  const bi = b[1];
  if (Math.abs(br) >= Math.abs(bi)) {
    e = bi / br;
    f = br + bi * e;
    out[0] = (ar + ai * e) / f;
    out[1] = (ai - ar * e) / f;
  } else {
    e = br / bi;
    f = br * e + bi;
    out[0] = (ar * e + ai) / f;
    out[1] = (ai * e - ar) / f;
  }
  return out;
}
