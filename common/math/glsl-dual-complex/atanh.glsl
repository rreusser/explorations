vec4 catanh(vec4 z) {
  return 0.5 * clog(cdiv(cadd(z, vec2(1,  0)), csub(vec2(1, 0), z)));
}
