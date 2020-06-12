vec4 csqrt(vec4 a) {
  float r = hypot(a.xy);
  float b = sqrt(2.0 * (r + a.x));
  float c = sqrt(2.0 * (r - a.x));
  float re = a.x >= 0.0 ? 0.5 * b : abs(a.y) / c;
  float im = a.x <= 0.0 ? 0.5 * c : abs(a.y) / b;
  vec2 s = vec2(re, a.y < 0.0 ? -im : im);
  return vec4(s, cmul(a.zw, 0.5 * cinv(s)));
}
