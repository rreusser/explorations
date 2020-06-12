vec4 cexp(vec4 a) {
  vec2 expa = cexp(a.xy);
  return vec4(expa, cmul(expa, a.zw));
}
