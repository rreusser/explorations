vec4 ccos(vec4 a) {
  vec4 asincos = csincos(a.xy);
  return vec4(asincos.zw, cmul(-asincos.xy, a.zw));
}
