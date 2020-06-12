vec4 cdiv (vec4 a, vec4 b) {
  return vec4(
    cdiv(a.xy, b.xy),
    cdiv(cmul(b.xy, a.zw) - cmul(a.xy, b.zw), csqr(b.xy))
  );
}

vec4 cdiv (vec2 a, vec4 b) {
  return vec4(
    cdiv(a.xy, b.xy),
    cdiv(-cmul(a.xy, b.zw), csqr(b.xy))
  );
}

vec4 cdiv (vec4 a, vec2 b) {
  return vec4(
    cdiv(a.xy, b.xy),
    cdiv(cmul(b.xy, a.zw), csqr(b.xy))
  );
}
