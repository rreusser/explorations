vec4 cacos(vec4 z) {
  vec4 s = -casin(z);
  s.x += HALF_PI;
  return s;
}
