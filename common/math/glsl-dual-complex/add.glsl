vec4 cadd(vec4 a, vec4 b) {
  return a + b;
}

vec4 cadd(vec2 a, vec4 b) {
  return vec4(a.xy + b.xy, b.zw);
}

vec4 cadd(vec4 a, vec2 b) {
  return vec4(a.xy + b.xy, a.zw);
}
