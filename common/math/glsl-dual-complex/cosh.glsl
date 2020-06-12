vec4 ccosh(vec4 z) {
  vec4 ez = cexp(z);
  return 0.5 * (ez + cinv(ez));
}
