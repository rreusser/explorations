module.exports = function cmul (out, a, b) {
  let ar = a[0]
  let ai = a[1];
  let br = b[0];
  let bi = b[1];
  out[0] = ar * br - ai * bi;
  out[1] = ar * bi + ai * br;
  return out;
};
