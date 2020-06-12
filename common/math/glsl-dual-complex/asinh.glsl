vec4 casinh(vec4 z) {
  return clog(cadd(z, csqrt(cadd(vec2(1, 0), csqr(z)))));
}
