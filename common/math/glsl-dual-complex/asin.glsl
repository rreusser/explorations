vec4 casin(vec4 z) {
  vec4 s = clog(vec4(-z.y, z.x, -z.w, z.z) + csqrt(csub(vec2(1, 0), csqr(z))));
  return vec4(s.y, -s.x, s.w, -s.z);
}
