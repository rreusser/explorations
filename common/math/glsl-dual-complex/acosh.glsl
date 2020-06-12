vec4 cacosh(vec4 z) {
  return clog(z + cmul(csqrt(cadd(z, vec2(1, 0))), csqrt(csub(z, vec2(1, 0)))));
}
