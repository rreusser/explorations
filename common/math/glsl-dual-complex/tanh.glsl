vec4 ctanh(vec4 z) {
  vec4 ez = cexp(z);
  vec4 ezinv = cinv(ez);
  return 0.5 * cdiv(ez - ezinv, ez + ezinv);
}
