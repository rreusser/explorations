vec4 cmul (vec4 a, vec4 b) {
  return vec4(
    cmul(a.xy, b.xy),
    cmul(a.xy, b.zw) + cmul(a.zw, b.xy)
  );
}

vec4 cmul (vec2 a, vec4 b) {
  return vec4(
    cmul(a.xy, b.xy),
    cmul(a.xy, b.zw)
  );
}

vec4 cmul (vec4 a, vec2 b) {
  return vec4(
    cmul(a.xy, b.xy),
    cmul(a.zw, b.xy)
  );
}

vec4 cmul (vec4 a, vec4 b, vec4 c) { return cmul(cmul(a, b), c); }
vec4 cmul (vec2 a, vec4 b, vec4 c) { return cmul(cmul(a, b), c); }
vec4 cmul (vec4 a, vec2 b, vec4 c) { return cmul(cmul(a, b), c); }
vec4 cmul (vec4 a, vec4 b, vec2 c) { return cmul(cmul(a, b), c); }
vec4 cmul (vec4 a, vec2 b, vec2 c) { return cmul(cmul(a, b), c); }
vec4 cmul (vec2 a, vec4 b, vec2 c) { return cmul(cmul(a, b), c); }
vec4 cmul (vec2 a, vec2 b, vec4 c) { return cmul(cmul(a, b), c); }
