vec4 clog(vec4 z) {
  return vec4(
    log(hypot(z.xy)),
    atan(z.y, z.x),
    cdiv(z.zw, z.xy)
  );
}
