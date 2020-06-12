vec4 cinv(vec4 a) {
  vec2 ainv = cinv(a.xy);
  return vec4(ainv, cmul(a.zw, -csqr(ainv)));
}
