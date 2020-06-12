vec4 csqr (vec4 a) {
  return vec4(
    csqr(a.xy),
    2.0 * cmul(a.xy, a.zw)
  );
}
