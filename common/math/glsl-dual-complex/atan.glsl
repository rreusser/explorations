vec4 catan(vec4 z) {
  vec2 s = clog(cdiv(cadd(vec2(0, 1), z.xy), csub(vec2(0, 1), z.xy)));
  return vec4(
     0.5 * vec2(-s.y, s.x),
     cmul(z.zw, cinv(cadd(vec2(1, 0), csqr(z))))
  );
}
